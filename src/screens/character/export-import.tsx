import React, { useState } from 'react';
import { useApp } from '@/contexts/app-provider';
import Button from '@/components/button';
import { FaFileExport, FaFileImport } from 'react-icons/fa';

export default function ExportImport() {
	const { macros, setMacros, openDialog } = useApp();
	const [importPreview, setImportPreview] = useState<any>(null);
	const [importError, setImportError] = useState<string | null>(null);

	const handleExport = () => {
		if (!macros || macros.length === 0) {
			openDialog({
				title: 'Export Error',
				message: 'No macros available to export.',
				confirmLabel: 'OK',
			});
			return;
		}

		// Create a blob with all macro data
		const blob = new Blob([JSON.stringify(macros, null, 2)], {
			type: 'application/json',
		});

		// Create a download link
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `all_macros.json`;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	const handleFileSelect = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (!target.files?.length) return;

		const file = target.files[0];
		const reader = new FileReader();

		reader.onload = event => {
			try {
				const json = JSON.parse(event.target?.result as string);
				setImportPreview(json);
				setImportError(null);
			} catch (error) {
				setImportError('Invalid JSON file format.');
				setImportPreview(null);
			}
		};

		reader.readAsText(file);
	};

	const handleImport = async () => {
		if (!importPreview) return;

		try {
			// First update the state
			setMacros(importPreview);

			// Then write to disk
			const result = await window.electronAPI.writeMacros(importPreview);
			if (result === 'No output from the executable.') {
				openDialog({
					title: 'Import Success',
					message: 'All macros imported successfully!',
					confirmLabel: 'OK',
				});
				// Clear the preview after successful import
				setImportPreview(null);
			} else {
				throw new Error(result);
			}
		} catch (error) {
			openDialog({
				title: 'Import Error',
				message: `Failed to import macros: ${error}`,
				confirmLabel: 'OK',
			});
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<h2 className="text-xl font-bold">Export / Import All Macros</h2>
			<div className="flex gap-4">
				<Button
					onClick={handleExport}
					variant="default"
					disabled={!macros || macros.length === 0}
				>
					<FaFileExport />
					Export All Macros
				</Button>
				<div className="flex flex-col gap-2">
					<Button
						onClick={() => {
							const input = document.createElement('input');
							input.type = 'file';
							input.accept = '.json';
							input.onchange = handleFileSelect;
							input.click();
						}}
						variant="default"
					>
						<FaFileImport />
						Select File to Import
					</Button>
					{importError && (
						<div className="text-red-500 text-sm">{importError}</div>
					)}
				</div>
			</div>
			{importPreview && (
				<div className="mt-4">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-lg font-semibold">Import Preview</h3>
						<div className="flex gap-2">
							<Button
								onClick={() => setImportPreview(null)}
								variant="destructive"
							>
								Cancel
							</Button>
							<Button
								onClick={handleImport}
								variant="default"
							>
								Import All Macros
							</Button>
						</div>
					</div>
					<div className="text-sm text-yellow-600 mb-2">
						Warning: This will overwrite all your current macros.
					</div>
					<pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
						{JSON.stringify(importPreview, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
