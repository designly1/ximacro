#include <stdio.h>
#include <stdlib.h>
#include "./vendor/dirent/dirent.h" // For opendir, readdir, closedir
#include <sys/stat.h>               // For stat
#include <string.h>                 // For strlen, etc.
#include <errno.h>

/**
 * Prints a JSON array of subdirectories in the specified path.
 * Usage: listdirs <dirpath>
 */
int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        fprintf(stderr, "Usage: %s <directory>\n", argv[0]);
        return 1;
    }

    const char *dirpath = argv[1];
    DIR *dp = opendir(dirpath);
    if (!dp)
    {
        fprintf(stderr, "Error: could not open directory '%s': %s\n",
                dirpath, strerror(errno));
        return 1;
    }

    // We'll collect subdirectory names in an array of strings
    // for demonstration. For large directories, you might want
    // a more dynamic approach, but this is a minimal example.
    // Instead, we can print them directly as we find them.

    printf("[");

    int count = 0;
    struct dirent *entry;
    while ((entry = readdir(dp)) != NULL)
    {
        // Skip "." and ".."
        if (strcmp(entry->d_name, ".") == 0 ||
            strcmp(entry->d_name, "..") == 0)
        {
            continue;
        }

        // Build full path to check if it's a directory
        char fullpath[1024];
        snprintf(fullpath, sizeof(fullpath), "%s/%s", dirpath, entry->d_name);

        struct stat sb;
        if (stat(fullpath, &sb) == 0 && S_ISDIR(sb.st_mode))
        {
            // It's a directory; print it in JSON
            // Comma-separate entries after the first
            if (count > 0)
                printf(",");
            // Minimal JSON-escaping in case of quotes/backslashes is omitted.
            // If you have unusual directory names, you may need more robust escaping.
            printf("\n  \"%s\"", entry->d_name);

            count++;
        }
    }

    closedir(dp);

    if (count > 0)
        printf("\n");
    printf("]\n");

    return 0;
}
