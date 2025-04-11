import React, { useState } from 'react';
import Button from '@/components/button';

import { useApp } from '@/contexts/app-provider';

interface Errors {
	[key: string]: string;
}

const defaultErrors: Errors = {
	ffxiDirectory: '',
};

export default function SettingsScreen() {
	const { ffxiDirectory, setFfxiDirectory, clearStore, openDialog } = useApp();
	const [errors, setErrors] = useState<Errors>(defaultErrors);

	const resetErrors = () => setErrors(defaultErrors);

	const handleSelectFolder = async () => {
		resetErrors();
		const elec = (window as any).electronAPI;
		const path = await elec.selectFolder();
		if (path) {
			setFfxiDirectory(path);
			await elec.setStore('ffxiPath', path);
		} else {
			setErrors({ ffxiDirectory: `No "USER" folder found in selected path` });
		}
	};

	const handleClearStore = async () => {
		openDialog({
			title: 'Clear All Data',
			message: 'Are you sure you want to clear all data?',
			onConfirm: async () => {
				clearStore();
			},
		});
	};

	const handleClearDirectory = async () => {
		const elec = (window as any).electronAPI;
		setFfxiDirectory(null);
		await elec.setStore('ffxiPath', null);
	};

	return (
		<div className="flex flex-col gap-4 p-4 mx-auto flex-1 w-[90%] max-w-5xl bg-white/45 overflow-y-auto">
			<h1 className="text-2xl font-bold text-center">Settings</h1>

			<div className="flex flex-col gap-4 w-full">
				<div className="flex flex-col gap-2 w-full">
					<label
						htmlFor="ffxi-dir-input"
						className="font-bold text-sm"
					>
						(FINAL FANTASY XI) Application Directory
					</label>
					<input
						id="ffxi-dir-input"
						name="ffxiDirectory"
						type="text"
						value={ffxiDirectory || ''}
						readOnly
						className="w-full p-2 border border-white/60 rounded bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
					/>
					<p className="text-sm text-red-500 m-0">{errors['ffxiDirectory']}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						className="w-1/4"
						onClick={handleSelectFolder}
						disabled={!!ffxiDirectory}
					>
						Select Folder
					</Button>
					<Button
						variant="destructive"
						className="w-1/4"
						onClick={handleClearDirectory}
						disabled={!ffxiDirectory}
					>
						Clear
					</Button>
				</div>
			</div>

			<div className="mt-auto flex justify-end">
				<Button
					variant="destructive"
					onClick={handleClearStore}
				>
					!Clear All Data!
				</Button>
			</div>
		</div>
	);
}
