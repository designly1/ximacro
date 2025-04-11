#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

#define NAME_OFFSET 0x18 // 24 decimal
#define NAME_SIZE 0x10   // 16 decimal

/**
 * Trims trailing null ('\0') bytes from a buffer in-place.
 */
static void trim_trailing_nulls(char *s, size_t len)
{
    for (size_t i = len; i > 0; i--)
    {
        if (s[i - 1] == '\0')
            s[i - 1] = '\0';
        else
            break;
    }
}

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        fprintf(stderr, "Usage: %s <binaryfile>\n", argv[0]);
        return 1;
    }

    FILE *fp = fopen(argv[1], "rb");
    if (!fp)
    {
        fprintf(stderr, "Could not open %s\n", argv[1]);
        return 1;
    }

    // Move to offset 0x18
    if (fseek(fp, NAME_OFFSET, SEEK_SET) != 0)
    {
        fprintf(stderr, "Error: Could not seek to 0x%X in file.\n", NAME_OFFSET);
        fclose(fp);
        return 1;
    }

    printf("[\n");

    int count = 0;
    while (1)
    {
        // Read 16 bytes for one name
        char nameBuf[NAME_SIZE];
        size_t bytesRead = fread(nameBuf, 1, NAME_SIZE, fp);
        if (bytesRead == 0)
        {
            // No more data
            break;
        }

        // If partial read, fill leftover with 0
        if (bytesRead < NAME_SIZE)
        {
            memset(nameBuf + bytesRead, 0, NAME_SIZE - bytesRead);
        }

        // Trim trailing null bytes
        trim_trailing_nulls(nameBuf, NAME_SIZE);

        // If the entire name is empty after trimming, we can decide to stop or continue
        // For now, we accept empty strings as valid
        // If you prefer to stop reading after an empty name, you could break here.

        // Print comma before subsequent entries
        if (count > 0)
        {
            printf(",\n");
        }

        // Print JSON string. For safety, we do minimal escaping of quotes/backslashes
        // If you have exotic characters, you may want more robust JSON escaping
        printf("  \"");

        for (char *p = nameBuf; *p; p++)
        {
            if (*p == '\"')
                printf("\\\"");
            else if (*p == '\\')
                printf("\\\\");
            else
                putchar(*p);
        }

        printf("\"");
        count++;
    }

    printf("\n]\n");
    fflush(stdout);

    fclose(fp);
    return 0;
}
