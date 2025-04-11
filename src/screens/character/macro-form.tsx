import React, { useState } from 'react';
import ClearableInput from '@/components/clearable-input';
import Button from '@/components/button';

import { useApp } from '@/contexts/app-provider';

import { FaSave, FaCheckCircle } from 'react-icons/fa';
import { FaRegCopy, FaPaste } from 'react-icons/fa';

import type { Macro } from '@/contexts/app-provider';

export default function MacroForm() {
	const {
		selectedMacroItem,
		setSelectedMacroItem,
		selectedMacroIndex,
		setSelectedMacro,
		handleSaveMacro,
		openDialog,
		copiedMacro,
		setCopiedMacro,
		selectedMacro,
		selectedMacroItemIndex,
		setSelectedMacroItemIndex,
	} = useApp();

	const [isCopied, setIsCopied] = useState(false);

	if (
		!selectedMacroItem ||
		selectedMacroIndex === null ||
		selectedMacroItemIndex === null
	)
		return null;

	const handleUpdateMacro = (macro: Macro, index: number) => {
		setSelectedMacroItem(macro);
		setSelectedMacroItemIndex(index);
	};

	const handleSave = () => {
		openDialog({
			title: 'Save Macro',
			message: 'Are you sure you want to save this macro?',
			onConfirm: () => {
				handleSaveMacro();
			},
			confirmLabel: 'Save',
			cancelLabel: 'Cancel',
		});
	};

	const handleCopy = () => {
		setIsCopied(true);
		navigator.clipboard.writeText(JSON.stringify(selectedMacroItem, null, 2));
		setCopiedMacro(selectedMacroItem);

		setTimeout(() => {
			setIsCopied(false);
		}, 500);
	};

	const handlePaste = () => {
		if (copiedMacro && selectedMacro) {
			const updatedMacro = {
				...copiedMacro,
				offset: selectedMacroItem.offset,
			};

			// Update the macro in the selectedMacro.macros array
			const macroIndex = selectedMacro.macros.findIndex(
				(macro: Macro) => macro.offset === selectedMacroItem.offset,
			);

			if (macroIndex !== -1) {
				const newMacro = { ...selectedMacro };
				newMacro.macros[macroIndex] = updatedMacro;
				setSelectedMacro(newMacro);
				console.log(newMacro);
				console.log(selectedMacro);
			}

			// Update the selected macro item
			handleUpdateMacro(updatedMacro, selectedMacroItemIndex);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-4 w-full mt-6">
				<div className="flex flex-col gap-2 w-full">
					<label className="font-bold text-sm">Macro Name</label>
					<ClearableInput
						value={selectedMacroItem.name}
						onChange={e =>
							handleUpdateMacro(
								{
									...selectedMacroItem,
									name: e.target.value,
								},
								selectedMacroItemIndex,
							)
						}
						onClear={() =>
							handleUpdateMacro(
								{
									...selectedMacroItem,
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
					{selectedMacroItem.lines.map((line, j) => (
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
											...selectedMacroItem,
											lines: selectedMacroItem.lines.map((l, i) =>
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
											...selectedMacroItem,
											lines: selectedMacroItem.lines.map((l, i) =>
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
					<Button onClick={handleSave}>
						<FaSave />
						Save
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
				</div>
			</div>
		</>
	);
}
