#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <ctype.h>

#define LINES_PER_MACRO 6
#define LINE_SIZE 0x3D
#define NAME_SIZE 0x0E
#define MACRO_SIZE ((LINES_PER_MACRO * LINE_SIZE) + NAME_SIZE)
#define MACRO_START 0x1C

// Trim leading and trailing spaces from a string
static void trim_whitespace(char *str)
{
    char *end;
    while (isspace((unsigned char)*str))
        str++;

    if (*str == 0)
        return;

    end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end))
        end--;

    *(end + 1) = 0;
}

static void print_data(const uint8_t *ptr, size_t max_len)
{
    for (size_t i = 0; i < max_len && ptr[i] != 0; i++)
    {
        char c = ptr[i];
        switch (c)
        {
        case '\"':
            printf("\\\"");
            break;
        case '\\':
            printf("\\\\");
            break;
        case '\b':
            printf("\\b");
            break;
        case '\f':
            printf("\\f");
            break;
        case '\n':
            printf("\\n");
            break;
        case '\r':
            printf("\\r");
            break;
        case '\t':
            printf("\\t");
            break;
        default:
            if (c >= 32 && c <= 126)
                printf("%c", c);
            else
                printf("\\u%04X", (unsigned char)c);
        }
    }
}

static void print_macro(const uint8_t *macro_ptr, size_t start_offset, size_t chunk_size)
{
    printf("{\"offset\":\"0x%04zX\",\"lines\":[", start_offset);

    for (int line = 0; line < LINES_PER_MACRO; line++)
    {
        size_t line_offset_in_file = start_offset + (line * LINE_SIZE);
        size_t offset_in_macro_ptr = line * LINE_SIZE;
        size_t bytes_left_in_this_macro = chunk_size - offset_in_macro_ptr;
        if (bytes_left_in_this_macro == 0)
            break;

        size_t can_print = (bytes_left_in_this_macro < LINE_SIZE) ? bytes_left_in_this_macro : LINE_SIZE;

        if (line > 0)
            printf(",");
        printf("{\"offset\":\"0x%04zX\",\"data\":\"", line_offset_in_file);
        print_data(&macro_ptr[offset_in_macro_ptr], can_print);
        printf("\"}");
    }

    printf("]");
    size_t name_start = LINES_PER_MACRO * LINE_SIZE;
    if (chunk_size > name_start)
    {
        size_t name_len_available = chunk_size - name_start;
        size_t name_len = (name_len_available < NAME_SIZE) ? name_len_available : NAME_SIZE;

        printf(",\"name\":\"");
        print_data(&macro_ptr[name_start], name_len);
        printf("\"}");
    }
    else
    {
        printf("}");
    }
}

static void process_macro_file(const char *filename, int *printed_any_macro)
{
    FILE *fp = fopen(filename, "rb");
    if (!fp)
        return;

    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp);
    fseek(fp, 0, SEEK_SET);

    if (file_size <= MACRO_START)
    {
        fclose(fp);
        return;
    }

    uint8_t *buffer = malloc(file_size);
    if (!buffer)
    {
        fclose(fp);
        return;
    }
    size_t bytes_read = fread(buffer, 1, file_size, fp);
    fclose(fp);
    if (bytes_read < MACRO_START)
    {
        free(buffer);
        return;
    }

    if (*printed_any_macro)
        printf(",");

    printf("{\"fileName\":\"");
    print_data((const uint8_t *)filename, strlen(filename));
    printf("\",\"fileSize\":%ld,\"macros\":[", file_size);

    int macro_index = 0;
    for (size_t offset = MACRO_START; offset < bytes_read; offset += MACRO_SIZE)
    {
        if (macro_index > 0)
            printf(",");
        macro_index++;
        size_t remain = bytes_read - offset;
        size_t chunk_size = (remain < MACRO_SIZE) ? remain : MACRO_SIZE;
        print_macro(&buffer[offset], offset, chunk_size);
    }

    printf("]}");

    *printed_any_macro = 1;

    free(buffer);
}

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        fprintf(stderr, "Usage: %s <directory_prefix>\n", argv[0]);
        return 1;
    }

    char directory_prefix[512];
#ifdef _MSC_VER
    strncpy_s(directory_prefix, sizeof(directory_prefix), argv[1], _TRUNCATE);
#else
    strncpy(directory_prefix, argv[1], sizeof(directory_prefix) - 1);
    directory_prefix[sizeof(directory_prefix) - 1] = '\0';
#endif
    trim_whitespace(directory_prefix);

    printf("[");
    int printed_any_macro = 0;

    char filename[768];
    snprintf(filename, sizeof(filename), "%s\\mcr.dat", directory_prefix);
    process_macro_file(filename, &printed_any_macro);

    for (int i = 1; i <= 400; i++)
    {
        snprintf(filename, sizeof(filename), "%s\\mcr%d.dat", directory_prefix, i);
        process_macro_file(filename, &printed_any_macro);
    }

    printf("]");
    fflush(stdout);
    return 0;
}
