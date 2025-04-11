import { ipcMain, dialog } from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import path, { resolve } from 'path';
import { exec } from 'child_process';
import log from 'electron-log/main';
import os from 'os';

import type { MacroItem } from '@/contexts/app-provider';

const BOOK_FILENAMES = ['mcr.ttl', 'mcr_2.ttl'];

/**
 * Mapping of executable filenames for macro operations.
 */
const executables = {
	import: 'ximacro_i.exe',
	export: 'ximacro_e.exe',
	chars: 'ximacro_c.exe',
	books: 'ximacro_b.exe',
};

/**
 * Default installation path for FFXI.
 */
const defaultPath = path.normalize('C:\\Program Files (x86)\\PlayOnline\\SquareEnix');

/**
 * Interface for the store operations.
 */
interface StoreInterface {
	get: <T>(key: keyof StoreValues) => T;
	set: <T>(key: keyof StoreValues, value: T) => void;
	clear: () => void;
}

const store = new Store() as unknown as StoreInterface;

/**
 * Gets the path to the executable based on the environment.
 */
const getExecutablePath = (executableName: string): string => {
	const isDev = process.env.NODE_ENV === 'development';
	return isDev
		? path.join(__dirname, '..\\..', 'bin', executableName)
		: path.join(process.resourcesPath, executableName);
};

/**
 * Arguments for the read-macros function.
 */
interface ReadMacrosArgs {
	path: string;
}

/**
 * Registers IPC handlers for Electron main process.
 */
export const registerHandlers = () => {
	log.initialize();

	// Remove previous handlers to prevent duplicate bindings
	ipcMain.removeHandler('select-folder');
	ipcMain.removeHandler('store:set');
	ipcMain.removeHandler('store:get');
	ipcMain.removeHandler('store:clear');
	ipcMain.removeHandler('read-macros');
	ipcMain.removeHandler('list-directories');

	/**
	 * Opens a dialog to select the FFXI installation folder.
	 * Ensures the selected folder contains the "USER" directory.
	 *
	 * @returns {Promise<string | null>} The selected folder path or null if invalid.
	 */
	ipcMain.handle('select-folder', async (): Promise<string | null> => {
		const { filePaths } = await dialog.showOpenDialog({
			title: 'Select FFXI Install Location',
			properties: ['openDirectory'],
			defaultPath,
		});

		if (filePaths.length === 0) return null;

		const selectedPath = filePaths[0];
		const userFolderPath = path.join(selectedPath, 'USER');

		if (
			!fs.existsSync(userFolderPath) ||
			!fs.statSync(userFolderPath).isDirectory()
		) {
			return null;
		}

		return selectedPath;
	});

	/**
	 * Saves a key-value pair persistently in the Electron store.
	 */
	ipcMain.handle('store:set', (_event, key: keyof StoreValues, value: any): boolean => {
		try {
			store.set(key, value);
			return true;
		} catch (error) {
			return false;
		}
	});

	/**
	 * Retrieves a value from the Electron store by key.
	 */
	ipcMain.handle('store:get', (_event, key: keyof StoreValues): any => {
		return store.get(key);
	});

	/**
	 * Clears all stored values from the Electron store.
	 */
	ipcMain.handle('store:clear', (): boolean => {
		try {
			store.clear();
			return true;
		} catch (error) {
			return false;
		}
	});

	/**
	 * Reads macros from a file using an external executable.
	 */
	ipcMain.handle(
		'read-macros',
		async (_event, args: ReadMacrosArgs): Promise<string> => {
			return new Promise((resolve, reject) => {
				const { path: filePath } = args;

				const exePath: string = getExecutablePath(executables.export);

				const command: string = `"${exePath}" "${filePath}"`;

				// Create a timeout to prevent hanging
				const timeout = setTimeout(() => {
					reject('Operation timed out after 30 seconds');
				}, 30000);

				exec(command, (error: Error | null, stdout: string, stderr: string) => {
					// Clear the timeout since the operation completed
					clearTimeout(timeout);

					if (error) {
						reject(`Error running the executable: ${error.message}`);
						return;
					}

					const output: string = stdout.trim();
					if (!output) {
						resolve('No output from the executable.');
						return;
					}

					resolve(output);
				});
			});
		},
	);

	interface WriteMacrosArgs {
		macros: MacroItem[];
	}

	ipcMain.handle(
		'write-macros',
		async (_event, args: WriteMacrosArgs): Promise<string> => {
			const { macros } = args;

			const json = JSON.stringify(macros);

			// Write to windows temp folder
			const tempFilePath = path.join(os.tmpdir(), 'macros.json');
			fs.writeFileSync(tempFilePath, json);

			const exePath: string = getExecutablePath(executables.import);

			const command: string = `type "${tempFilePath}" | "${exePath}"`;

			return new Promise((resolve, reject) => {
				// Create a timeout to prevent hanging
				const timeout = setTimeout(() => {
					reject('Operation timed out after 30 seconds');
				}, 30000);

				exec(
					command,
					{ maxBuffer: 1024 * 1024 * 10 },
					(error, stdout, stderr) => {
						// Clear the timeout since the operation completed
						clearTimeout(timeout);

						if (error) {
							reject(`Error running the executable: ${error.message}`);
							return;
						}

						const output: string = stdout.trim();
						if (!output) {
							resolve('No output from the executable.');
							return;
						}

						resolve(output);
					},
				);
			});
		},
	);

	interface ReadBooksArgs {
		dataFolder: string;
	}

	/**
	 * Reads macro book names from a file using an external executable.
	 */
	ipcMain.handle(
		'read-books',
		async (_event, args: ReadBooksArgs): Promise<string[] | string> => {
			const { dataFolder } = args;
			const ffxiDirectory = store.get('ffxiPath') as string | undefined;

			if (!ffxiDirectory) {
				return 'FFXI directory not set.';
			}

			const exePath: string = getExecutablePath(executables.books);

			try {
				// Create an array of promises for each file execution
				const bookPromises = BOOK_FILENAMES.map(filename => {
					return new Promise<string[]>((resolve, reject) => {
						const filePath = path.join(
							ffxiDirectory,
							'USER',
							dataFolder,
							filename,
						);
						const command: string = `"${exePath}" "${filePath}"`;

						// Create a timeout to prevent hanging
						const timeout = setTimeout(() => {
							reject('Operation timed out after 30 seconds');
						}, 30000);

						exec(command, (error, stdout, stderr) => {
							// Clear the timeout since the operation completed
							clearTimeout(timeout);

							if (error) {
								reject(`Error running the executable: ${error.message}`);
								return;
							}

							const output: string = stdout.trim();
							if (!output) {
								resolve([]);
								return;
							}

							try {
								const json = JSON.parse(output);
								resolve(json);
							} catch (parseError) {
								reject('Failed to parse book names.');
							}
						});
					});
				});

				// Wait for all executions to complete
				const results = await Promise.all(bookPromises);

				// Flatten the results array and remove duplicates
				const bookNames = [...new Set(results.flat())];

				return bookNames;
			} catch (error) {
				return String(error);
			}
		},
	);

	/**
	 * Lists directories inside the given directory path.
	 */
	ipcMain.handle(
		'list-directories',
		async (_event, dirPath: string): Promise<string[] | string> => {
			return new Promise(resolve => {
				if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
					resolve('Invalid directory path.');
					return;
				}

				fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
					if (err) {
						resolve('Error reading directory.');
						return;
					}

					const directories = files
						.filter(file => file.isDirectory())
						.map(dir => dir.name);

					resolve(directories);
				});
			});
		},
	);
};
