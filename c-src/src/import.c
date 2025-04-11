#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <stdint.h>
#include <errno.h>

#include "./vendor/cJSON/cJSON.h"

// -----------------
// CONFIGURATION
// -----------------
#define DEBUG_PRINT 1 // 0 = OFF, 1 = ON

// Macros for conditional debug output
#if DEBUG_PRINT
#define DBG_PRINTF(...) fprintf(stderr, __VA_ARGS__)
#else
#define DBG_PRINTF(...) // no-op
#endif

// Constants matching your exporter:
#define LINES_PER_MACRO 6
#define LINE_SIZE 0x3D
#define NAME_SIZE 0x0E
#define MACRO_SIZE ((LINES_PER_MACRO * LINE_SIZE) + NAME_SIZE)
#define MACRO_START 0x1C

// -------------------------------------------------------------------
// Utility to create the "macro_backup" directory if it doesn't exist
// -------------------------------------------------------------------
static int ensure_macro_backup_dir(void)
{
    struct stat st;
    if (stat("macro_backup", &st) == 0)
    {
        // already exists
        if ((st.st_mode & S_IFDIR) != 0)
        {
            DBG_PRINTF("[DEBUG] 'macro_backup' directory already exists.\n");
            return 0; // success
        }
        else
        {
            DBG_PRINTF("[DEBUG] 'macro_backup' is not a directory!\n");
            return -1;
        }
    }

    // Directory does not exist; attempt to create it
    DBG_PRINTF("[DEBUG] Creating 'macro_backup' directory...\n");

#if defined(_WIN32)
    // On Windows, use _mkdir
    if (_mkdir("macro_backup") != 0)
#else
    // On Unix-like, use mkdir with mode 0755
    if (mkdir("macro_backup", 0755) != 0)
#endif
    {
        DBG_PRINTF("[DEBUG] Failed to create 'macro_backup' directory: %s\n", strerror(errno));
        return -2;
    }

    DBG_PRINTF("[DEBUG] Created 'macro_backup' directory.\n");
    return 0;
}

// -------------------------------------------------------------------
// Writes data from file 'srcFilename' to 'dstFilename' in a naive way
// Returns 0 on success, nonzero on failure
// -------------------------------------------------------------------
static int copy_file(const char *srcFilename, const char *dstFilename)
{
    FILE *fin = fopen(srcFilename, "rb");
    if (!fin)
    {
        DBG_PRINTF("[DEBUG] Could not open '%s' for reading.\n", srcFilename);
        return -1;
    }

    FILE *fout = fopen(dstFilename, "wb");
    if (!fout)
    {
        DBG_PRINTF("[DEBUG] Could not open '%s' for writing.\n", dstFilename);
        fclose(fin);
        return -2;
    }

    char buf[4096];
    size_t n;
    while ((n = fread(buf, 1, sizeof(buf), fin)) > 0)
    {
        if (fwrite(buf, 1, n, fout) != n)
        {
            DBG_PRINTF("[DEBUG] Error writing to '%s'.\n", dstFilename);
            fclose(fin);
            fclose(fout);
            return -3;
        }
    }
    fclose(fin);
    fclose(fout);
    return 0;
}

// -------------------------------------------------------------------
// Extract just the filename from a path. E.g. "C:\foo\bar.dat" -> "bar.dat"
// (We handle either '\' or '/' as a separator for convenience.)
// -------------------------------------------------------------------
static const char *get_basename(const char *path)
{
    const char *base = path;
    // forward slash
    const char *p = strrchr(path, '/');
    if (p && *(p + 1))
        base = p + 1;

    // backslash
    p = strrchr(base, '\\');
    if (p && *(p + 1))
        base = p + 1;

    return base;
}

// -------------------------------------------------------------------
// Backup the file into macro_backup/<basename>
// Returns 0 on success, nonzero on failure
// -------------------------------------------------------------------
static int backup_file(const char *filename)
{
    // Ensure macro_backup directory
    if (ensure_macro_backup_dir() != 0)
    {
        DBG_PRINTF("[DEBUG] Could not prepare macro_backup directory.\n");
        return -1;
    }

    // Build backup path
    const char *bn = get_basename(filename);
    char backup_path[1024];
    snprintf(backup_path, sizeof(backup_path), "macro_backup/%s", bn);

    DBG_PRINTF("[DEBUG] Backing up '%s' -> '%s'\n", filename, backup_path);
    return copy_file(filename, backup_path);
}

// -------------------------------------------------------------------
// Write a block of data at offset, up to max_bytes
// -------------------------------------------------------------------
static void overwrite_block_in_buffer(
    uint8_t *buffer,
    size_t buffer_size,
    size_t offset,
    const char *text_to_write,
    size_t max_bytes)
{
    DBG_PRINTF("  [DEBUG] overwrite_block_in_buffer: offset=0x%zX, text=\"%s\", max_bytes=%zu\n",
               offset, text_to_write, max_bytes);

    if (offset >= buffer_size)
    {
        DBG_PRINTF("  [DEBUG]   -> offset=0x%zX beyond file size=%zu, skipping.\n",
                   offset, buffer_size);
        return;
    }

    size_t text_len = strlen(text_to_write);
    size_t space_available = buffer_size - offset;
    size_t to_copy = (text_len < max_bytes) ? text_len : max_bytes;
    if (to_copy > space_available)
    {
        to_copy = space_available;
    }

    DBG_PRINTF("  [DEBUG]   -> copying %zu bytes to offset=0x%zX.\n", to_copy, offset);
    memcpy(&buffer[offset], text_to_write, to_copy);

    // Zero-fill if there's leftover in this field
    if (to_copy < max_bytes && (to_copy < space_available))
    {
        size_t fill = max_bytes - to_copy;
        if (fill > (space_available - to_copy))
        {
            fill = space_available - to_copy;
        }
        memset(&buffer[offset + to_copy], 0, fill);
        DBG_PRINTF("  [DEBUG]   -> zero-filled %zu bytes after data.\n", fill);
    }
}

// -------------------------------------------------------------------
// Overwrite lines + name for one macro object
// {
//   "offset": "0x1C",
//   "lines": [ {"offset":"0x1C","data":"..."}, ... ],
//   "name":"...",
//   "nameOffset":"0x2C" // optional
// }
// -------------------------------------------------------------------
static void process_macro_object(cJSON *macroObj, uint8_t *buffer, size_t buffer_size)
{
    if (!cJSON_IsObject(macroObj))
    {
        DBG_PRINTF("  [DEBUG] skipping macroObj - not an object.\n");
        return;
    }

    cJSON *offsetItem = cJSON_GetObjectItemCaseSensitive(macroObj, "offset");
    if (!cJSON_IsString(offsetItem))
    {
        DBG_PRINTF("  [DEBUG] macro has no valid 'offset' string.\n");
        return;
    }
    size_t macro_offset = strtoul(offsetItem->valuestring, NULL, 16);

    DBG_PRINTF("  [DEBUG] Macro offset=0x%zX\n", macro_offset);

    // Overwrite lines
    cJSON *lines = cJSON_GetObjectItemCaseSensitive(macroObj, "lines");
    if (cJSON_IsArray(lines))
    {
        cJSON *lineObj = NULL;
        cJSON_ArrayForEach(lineObj, lines)
        {
            cJSON *lineOffsetItem = cJSON_GetObjectItemCaseSensitive(lineObj, "offset");
            cJSON *dataItem = cJSON_GetObjectItemCaseSensitive(lineObj, "data");
            if (!cJSON_IsString(lineOffsetItem) || !cJSON_IsString(dataItem))
            {
                DBG_PRINTF("  [DEBUG]  -> skipping lineObj with missing offset/data.\n");
                continue;
            }
            size_t line_offset = strtoul(lineOffsetItem->valuestring, NULL, 16);
            DBG_PRINTF("  [DEBUG]  -> Overwriting line at 0x%zX with \"%s\"\n",
                       line_offset, dataItem->valuestring);

            overwrite_block_in_buffer(buffer, buffer_size, line_offset,
                                      dataItem->valuestring, LINE_SIZE);
        }
    }
    else
    {
        DBG_PRINTF("  [DEBUG] macro has no 'lines' array.\n");
    }

    // Overwrite name
    cJSON *nameItem = cJSON_GetObjectItemCaseSensitive(macroObj, "name");
    if (cJSON_IsString(nameItem))
    {
        cJSON *nameOffsetItem = cJSON_GetObjectItemCaseSensitive(macroObj, "nameOffset");
        size_t name_offset = 0;
        if (cJSON_IsString(nameOffsetItem))
        {
            name_offset = strtoul(nameOffsetItem->valuestring, NULL, 16);
            DBG_PRINTF("  [DEBUG]   -> nameOffset=0x%zX from JSON\n", name_offset);
        }
        else
        {
            name_offset = macro_offset + (LINES_PER_MACRO * LINE_SIZE);
            DBG_PRINTF("  [DEBUG]   -> nameOffset fallback=0x%zX\n", name_offset);
        }
        DBG_PRINTF("  [DEBUG]   -> Overwriting name at 0x%zX with \"%s\"\n",
                   name_offset, nameItem->valuestring);
        overwrite_block_in_buffer(buffer, buffer_size, name_offset,
                                  nameItem->valuestring, NAME_SIZE);
    }
    else
    {
        DBG_PRINTF("  [DEBUG] macro has no 'name' field.\n");
    }
}

// -------------------------------------------------------------------
// For one file object:
//   1) backups the file to macro_backup/<basename>
//   2) loads into memory
//   3) overwrites macros
//   4) rewrites
// -------------------------------------------------------------------
static void import_one_file_object(cJSON *fileObj)
{
    if (!cJSON_IsObject(fileObj))
    {
        DBG_PRINTF("[DEBUG] skipping fileObj - not object.\n");
        return;
    }

    cJSON *fileNameItem = cJSON_GetObjectItemCaseSensitive(fileObj, "fileName");
    if (!cJSON_IsString(fileNameItem))
    {
        DBG_PRINTF("[DEBUG] fileObj missing 'fileName' string.\n");
        return;
    }
    const char *filename = fileNameItem->valuestring;

    DBG_PRINTF("\n[DEBUG] Importing file: '%s'\n", filename);

    // Backup
    int backup_res = backup_file(filename);
    if (backup_res != 0)
    {
        fprintf(stderr, "[DEBUG] Warning: Could not backup '%s' (err=%d)\n",
                filename, backup_res);
        // continue anyway if desired
    }

    // Read file into memory
    FILE *fp = fopen(filename, "rb");
    if (!fp)
    {
        fprintf(stderr, "[DEBUG] Could not open '%s' for reading.\n", filename);
        return;
    }

    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp);
    fseek(fp, 0, SEEK_SET);
    DBG_PRINTF("[DEBUG]   -> file_size=%ld\n", file_size);

    if (file_size <= 0)
    {
        fclose(fp);
        fprintf(stderr, "[DEBUG] File '%s' is empty or invalid.\n", filename);
        return;
    }

    uint8_t *buffer = malloc(file_size);
    if (!buffer)
    {
        fclose(fp);
        fprintf(stderr, "[DEBUG] Out of memory reading '%s'.\n", filename);
        return;
    }
    size_t bytes_read = fread(buffer, 1, file_size, fp);
    fclose(fp);

    DBG_PRINTF("[DEBUG]   -> bytes_read=%zu\n", bytes_read);
    if (bytes_read < (size_t)file_size)
    {
        fprintf(stderr, "[DEBUG] Could not read entire file '%s'.\n", filename);
    }

    // Overwrite macros from JSON
    cJSON *macrosArray = cJSON_GetObjectItemCaseSensitive(fileObj, "macros");
    if (!cJSON_IsArray(macrosArray))
    {
        DBG_PRINTF("[DEBUG]   -> no 'macros' array in fileObj.\n");
    }
    else
    {
        DBG_PRINTF("[DEBUG]   -> Parsing macros array...\n");
        cJSON *macroObj = NULL;
        cJSON_ArrayForEach(macroObj, macrosArray)
        {
            process_macro_object(macroObj, buffer, bytes_read);
        }
    }

    // Write updated data back
    DBG_PRINTF("[DEBUG]   -> Rewriting file '%s'...\n", filename);
    fp = fopen(filename, "wb");
    if (!fp)
    {
        fprintf(stderr, "[DEBUG] Could not open '%s' for writing.\n", filename);
        free(buffer);
        return;
    }

    size_t written = fwrite(buffer, 1, bytes_read, fp);
    fclose(fp);
    free(buffer);

    if (written < bytes_read)
    {
        fprintf(stderr, "[DEBUG] Could not write entire file '%s'.\n", filename);
    }
    else
    {
        DBG_PRINTF("[DEBUG]   -> Successfully wrote %zu bytes to '%s'.\n",
                   written, filename);
    }
}

// -------------------------------------------------------------------
// Main: read JSON from stdin, parse, import each file
// -------------------------------------------------------------------
int main(void)
{
    DBG_PRINTF("[DEBUG] Starting import...\n");

    // Read all input into a buffer first
    char buffer[4096];
    size_t total_size = 0;
    size_t capacity = 16384; // Start with 16KB
    char *json_text = malloc(capacity);
    
    if (!json_text) {
        fprintf(stderr, "[DEBUG] Initial memory allocation failed.\n");
        return 1;
    }

    size_t bytes_read;
    while ((bytes_read = fread(buffer, 1, sizeof(buffer), stdin)) > 0) {
        if (total_size + bytes_read > capacity) {
            capacity *= 2;
            char *new_buffer = realloc(json_text, capacity);
            if (!new_buffer) {
                fprintf(stderr, "[DEBUG] Memory reallocation failed.\n");
                free(json_text);
                return 1;
            }
            json_text = new_buffer;
        }
        memcpy(json_text + total_size, buffer, bytes_read);
        total_size += bytes_read;
    }

    if (total_size == 0) {
        DBG_PRINTF("[DEBUG] No input received.\n");
        free(json_text);
        return 1;
    }

    // Ensure null termination
    if (total_size + 1 > capacity) {
        char *new_buffer = realloc(json_text, total_size + 1);
        if (!new_buffer) {
            fprintf(stderr, "[DEBUG] Final buffer expansion failed.\n");
            free(json_text);
            return 1;
        }
        json_text = new_buffer;
    }
    json_text[total_size] = '\0';

    DBG_PRINTF("[DEBUG] Total bytes read: %zu\n", total_size);
    DBG_PRINTF("[DEBUG] First 100 bytes of input: %.100s\n", json_text);

    cJSON *root = cJSON_Parse(json_text);
    if (!root) {
        const char *error_ptr = cJSON_GetErrorPtr();
        if (error_ptr) {
            size_t context_start = (error_ptr - json_text > 20) ? 20 : error_ptr - json_text;
            DBG_PRINTF("[DEBUG] Parse error near: ...%.*s\n", 40, error_ptr - context_start);
        }
        fprintf(stderr, "[DEBUG] JSON parse error.\n");
        free(json_text);
        return 1;
    }

    free(json_text);

    if (!cJSON_IsArray(root)) {
        fprintf(stderr, "[DEBUG] Top-level JSON not an array.\n");
        cJSON_Delete(root);
        return 1;
    }

    DBG_PRINTF("[DEBUG] Processing file objects in array...\n");

    cJSON *fileObj = NULL;
    cJSON_ArrayForEach(fileObj, root) {
        import_one_file_object(fileObj);
    }

    cJSON_Delete(root);
    DBG_PRINTF("[DEBUG] Finished import.\n");
    fflush(stderr);
    return 0;
}
