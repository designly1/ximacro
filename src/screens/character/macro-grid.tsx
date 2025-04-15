import React from 'react';
import Button from '@/components/button';

import { useApp } from '@/contexts/app-provider';

import { cn } from '@/lib/utils';

import { FaSave, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { FaRegCopy, FaPaste } from 'react-icons/fa';

const isControl = (index: number) => {
	return index < 10;
};

interface MacroGridProps {
	disabled: boolean;
}

export default function MacroGrid(props: MacroGridProps) {
	const { disabled } = props;

	const {
		selectedMacro,
		selectedMacroIndex,
		selectedMacroItemIndex,
		setSelectedMacroItemIndex,
		setSelectedMacroItem,
		setCopiedMacroPage,
		setSaveMacroSignal,
		setSelectedMacro,
		copiedMacroPage,
		deleteMacroSignal,
		setDeleteMacroSignal,
		openDialog,
	} = useApp();

	if (!selectedMacro || selectedMacroIndex === null) return null;

	const handleDelete = () => {
		openDialog({
			title: 'Delete Page',
			message:
				'Are you sure you want to delete this page? This action cannot be undone.',
			onConfirm: () => {
				setDeleteMacroSignal(1);
			},
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
		});
	};

	const handlePastePage = () => {
		if (copiedMacroPage) {
			// Create a new macro object with the same structure but with the copied macros
			const updatedMacro = {
				...selectedMacro,
				macros: [...copiedMacroPage.macros],
			};
			setSelectedMacro(updatedMacro);
			setSaveMacroSignal(1); // Trigger save
		}
	};

	return (
		<div className="flex flex-col gap-8 w-full max-w-6xl mx-auto mt-6">
			<div
				className={cn('grid grid-cols-10 border-collapse border-r border-b', {
					'border-gray-300': disabled,
					'border-gray-200': !disabled,
				})}
			>
				{selectedMacro.macros.map((macro, index) => {
					const isLastRow =
						Math.floor(index / 10) ===
						Math.floor((selectedMacro.macros.length - 1) / 10);
					const isLastColumn = index % 10 === 9;

					const controlIndex = index + 1;
					const altIndex = index - 9;
					const isSelected = selectedMacroItemIndex === index;

					const buttonClasses = cn(
						'flex flex-col p-2 h-20 cursor-pointer transition-colors duration-300 ease-in-out',
						{
							'bg-gray-200 border-gray-300': disabled,
							'bg-blue-500 text-white hover:bg-blue-600': !disabled,
							'border-r': !isLastColumn,
							'border-b': !isLastRow,
							'border-l border-t': index === 0,
							'border-l': index % 10 === 0,
							'border-t': Math.floor(index / 10) === 0,
							'bg-blue-700 text-white hover:bg-blue-800':
								!disabled && isSelected,
						},
					);

					if (disabled) {
						return (
							<div
								key={index}
								className={buttonClasses}
							></div>
						);
					}

					return (
						<button
							key={index}
							className={buttonClasses}
							onClick={() => {
								setSelectedMacroItem(macro);
								setSelectedMacroItemIndex(index);
							}}
						>
							<span className="text-lg font-bold flex-1 text-center">
								{macro.name}
							</span>
							<span className="text-sm flex-1 text-center">
								{isControl(index)
									? 'CTRL-' + (controlIndex === 10 ? 0 : controlIndex)
									: 'ALT-' + (altIndex === 10 ? 0 : altIndex)}
							</span>
						</button>
					);
				})}
			</div>
			<div className="flex items-center gap-2">
				<Button
					onClick={() => {
						setCopiedMacroPage({ ...selectedMacro });
					}}
				>
					<FaRegCopy />
					Copy Page
				</Button>
				{copiedMacroPage &&
					selectedMacro.fileName !== copiedMacroPage.fileName && (
						<Button onClick={handlePastePage}>
							<FaPaste />
							Paste Page
						</Button>
					)}
				<Button
					onClick={handleDelete}
					variant="destructive"
				>
					<FaTrash />
					Delete Page
				</Button>
			</div>
		</div>
	);
}
