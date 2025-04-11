#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

void dump_file(const char *filename)
{
    FILE *file = fopen(filename, "rb");
    if (file == NULL)
    {
        printf("Could not open file: %s\n", filename);
        return;
    }

    printf("\nDumping file: %s\n", filename);
    printf("------------------------------------------\n");

    // Get file size
    fseek(file, 0, SEEK_END);
    long file_size = ftell(file);
    fseek(file, 0, SEEK_SET);

    printf("File size: %ld bytes\n\n", file_size);

    uint8_t *buffer = (uint8_t *)malloc(file_size);
    if (!buffer)
    {
        printf("Memory allocation failed for %s\n", filename);
        fclose(file);
        return;
    }

    size_t bytes_read = fread(buffer, 1, file_size, file);

    // Print bytes as characters when possible
    for (size_t i = 0; i < bytes_read; i++)
    {
        if (i % 16 == 0)
        {
            printf("\n%04zX: ", i); // Print offset at start of line
        }

        // If it's a printable character, print it
        if (buffer[i] >= 32 && buffer[i] <= 126)
        {
            printf(" %c  ", buffer[i]);
        }
        else
        {
            // Print hex for non-printable characters
            printf("%02X ", buffer[i]);
        }
    }
    printf("\n");

    free(buffer);
    fclose(file);
}

int main()
{
    char filename[256];
    const char *base_path = "C:\\Users\\jay\\Downloads\\167334f\\mcr";

    // Process mcr.dat
    snprintf(filename, sizeof(filename), "%s.dat", base_path);
    dump_file(filename);
    return 0;

    // Process mcr1 through mcr20
    for (int i = 1; i <= 20; i++)
    {
        snprintf(filename, sizeof(filename), "%s%d.dat", base_path, i);
        dump_file(filename);
    }

    return 0;
}