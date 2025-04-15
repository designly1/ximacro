import React, { useState, useEffect } from 'react';
import ClearableInput from '@/components/clearable-input';
import Button from '@/components/button';

import { useApp } from '@/contexts/app-provider';

import { FaSave, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { FaRegCopy, FaPaste } from 'react-icons/fa';

import type { Macro } from '@/contexts/app-provider';

export default function MacroForm() {
	const {
		selectedMacroItem,
		setSelectedMacroItem,
		selectedMacroIndex,
		setSelectedMacro,
		handleSaveMacro,
		handleDeleteMacro,
		openDialog,
		copiedMacro,
		setCopiedMacro,
		selectedMacro,
		selectedMacroItemIndex,
		setSelectedMacroItemIndex,
		setSaveMacroSignal,
	} = useApp();

	const [isCopied, setIsCopied] = useState(false);
	const [localMacro, setLocalMacro] = useState<Macro | null>(null);
	const [hasChanges, setHasChanges] = useState(false);

	// Initialize local state when selectedMacroItem changes
	useEffect(() => {
		if (selectedMacroItem) {
			setLocalMacro(selectedMacroItem);
			setHasChanges(false);
		}
	}, [selectedMacroItem]);

	if (
		!selectedMacroItem ||
		selectedMacroIndex === null ||
		selectedMacroItemIndex === null ||
		!localMacro
	)
		return null;

	const handleUpdateMacro = (macro: Macro, index: number) => {
		setLocalMacro(macro);
		setHasChanges(true);
	};

	const handleSave = () => {
		openDialog({
			title: 'Save Macro',
			message:
				'Are you sure you want to save this macro? Make sure you are not logged in on this character before proceeding!',
			onConfirm: () => {
				setSaveMacroSignal(1);
				setSelectedMacroItem(localMacro);
				setHasChanges(false);
			},
			confirmLabel: 'Save',
			cancelLabel: 'Cancel',
		});
	};

	const handleCopy = () => {
		setIsCopied(true);
		navigator.clipboard.writeText(JSON.stringify(localMacro, null, 2));
		setCopiedMacro(localMacro);

		setTimeout(() => {
			setIsCopied(false);
		}, 500);
	};

	const handlePaste = () => {
		if (copiedMacro && selectedMacro) {
			const updatedMacro = {
				...copiedMacro,
				offset: localMacro.offset,
			};

			// Update the macro in the selectedMacro.macros array
			const macroIndex = selectedMacro.macros.findIndex(
				(macro: Macro) => macro.offset === localMacro.offset,
			);

			if (macroIndex !== -1) {
				const newMacro = { ...selectedMacro };
				newMacro.macros[macroIndex] = updatedMacro;
				setSelectedMacro(newMacro);
			}

			// Update the local macro
			setLocalMacro(updatedMacro);
			setHasChanges(true);
		}
	};

	const handleDelete = () => {
		openDialog({
			title: 'Delete Macro',
			message: 'Are you sure you want to delete this macro?',
			onConfirm: () => {
				setLocalMacro(null);
			},
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
		});
	};

	return (
		<>
			<div className="flex flex-col gap-4 w-full mt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-bold">Macro Editor</h2>
					{hasChanges && (
						<span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
							Unsaved Changes
						</span>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full">
					<label className="font-bold text-sm">Macro Name</label>
					<ClearableInput
						value={localMacro.name}
						onChange={e =>
							handleUpdateMacro(
								{
									...localMacro,
									name: e.target.value,
								},
								selectedMacroItemIndex,
							)
						}
						onClear={() =>
							handleUpdateMacro(
								{
									...localMacro,
									name: '',
								},
								selectedMacroItemIndex,
							)
						}
						placeholder={`Macro Name`}
						showButtonWhenEmpty={false}
						maxLength={8}
					/>
					{/*6 macro lines*/}
					{localMacro.lines.map((line, j) => (
						<div
							className="flex flex-col gap-2 w-full"
							key={j}
						>
							<label className="font-bold text-sm">Line {j + 1}</label>
							<ClearableInput
								className="relative"
								value={line.data}
								onChange={e =>
									handleUpdateMacro(
										{
											...localMacro,
											lines: localMacro.lines.map((l, i) =>
												i === j
													? { ...l, data: e.target.value }
													: l,
											),
										},
										selectedMacroItemIndex,
									)
								}
								onClear={() =>
									handleUpdateMacro(
										{
											...localMacro,
											lines: localMacro.lines.map((l, i) =>
												i === j ? { ...l, data: '' } : l,
											),
										},
										selectedMacroItemIndex,
									)
								}
								placeholder={`Line ${j + 1}`}
								showButtonWhenEmpty={false}
								maxLength={36}
							/>
						</div>
					))}
				</div>
				<div className="flex gap-6">
					<Button
						onClick={handleSave}
						disabled={!hasChanges}
						variant={hasChanges ? 'default' : 'muted'}
						className={hasChanges ? 'animate-pulse' : ''}
					>
						<FaSave />
						Save {hasChanges ? '(Unsaved Changes)' : ''}
					</Button>
					{Boolean(copiedMacro) ? (
						<Button
							onClick={handlePaste}
							variant="success"
						>
							<FaPaste />
							Paste Macro
						</Button>
					) : (
						<Button
							onClick={handleCopy}
							variant="success"
						>
							{isCopied ? <FaCheckCircle /> : <FaRegCopy />}
							Copy Macro
						</Button>
					)}
					<Button
						onClick={handleDelete}
						variant="destructive"
					>
						<FaTrash />
						Delete Macro
					</Button>
				</div>
			</div>
		</>
	);
}
