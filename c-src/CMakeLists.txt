cmake_minimum_required(VERSION 3.10)
project(ximacro C)

# Set C standard
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Set output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# cJSON library
set(CJSON_DIR "${CMAKE_SOURCE_DIR}/src/vendor/cJSON")
add_library(cjson STATIC "${CJSON_DIR}/cJSON.c")
target_include_directories(cjson PUBLIC "${CJSON_DIR}")

# Build executables
add_executable(ximacro_e src/export.c)
add_executable(ximacro_i src/import.c)
add_executable(ximacro_b src/books.c)
add_executable(ximacro_c src/chars.c)

# Link cjson where needed
target_link_libraries(ximacro_i PRIVATE cjson)

# Here is the key line for dirent:
target_include_directories(ximacro_c PRIVATE 
    "${CMAKE_SOURCE_DIR}/src/vendor/dirent"
)

# Or, if multiple targets need it:
# target_include_directories(ximacro_e PRIVATE "${CMAKE_SOURCE_DIR}/src/vendor/dirent")
# target_include_directories(ximacro_i PRIVATE "${CMAKE_SOURCE_DIR}/src/vendor/dirent")
# ...

# Compiler warnings
foreach(target ximacro_e ximacro_i ximacro_b ximacro_c)
    if(MSVC)
        target_compile_options(${target} PRIVATE /W4)
    else()
        target_compile_options(${target} PRIVATE -Wall -Wextra -Wpedantic)
    endif()
endforeach()

# Install (optional)
install(TARGETS ximacro_e ximacro_i ximacro_b ximacro_c
        RUNTIME DESTINATION bin
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib)
