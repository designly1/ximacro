import React, { useEffect, useState } from 'react';
import Alert from '@/components/alert';
import Button from '@/components/button';
import BookView from '@/screens/character/book-view';

import { useApp } from '@/contexts/app-provider';
import { toast } from 'react-toastify';

export default function CharacterScreen() {
	const {
		selectedCharacter,
		macros,
		setMacros,
		loadMacros,
		error,
		setError,
		openDialog,
		removeCharacter,
		setScreen,
		setBackButtonCallback,
		setSelectedMacro,
		selectedMacro,
		selectedMacroIndex,
	} = useApp();

	useEffect(() => {
		if (selectedCharacter) {
			loadMacros();
		}
	}, [selectedCharacter]);

	useEffect(() => {
		if (!selectedMacro) {
			setBackButtonCallback(() => {
				setSelectedMacro(null);
			});
		}
	}, [selectedMacro]);

	const handleCancel = () => {
		setSelectedMacro(null);
	};

	const handleDeleteCharacter = () => {
		if (selectedCharacter) {
			openDialog({
				title: 'Delete Character',
				message: `Are you sure you want to delete ${selectedCharacter.name}?`,
				onConfirm: () => {
					removeCharacter(selectedCharacter.name);
					toast.success('Character deleted!');
					setScreen('main');
				},
			});
		}
	};

	return (
		<div className="flex flex-col gap-4 px-6 py-10 mx-auto flex-1 w-[90%] max-w-5xl bg-white/45 overflow-y-auto">
			{selectedMacro && selectedMacroIndex !== null && selectedCharacter ? (
				<h1 className="text-2xl font-bold text-center">
					{`${selectedCharacter.name} / Page #${selectedMacroIndex + 1}`}
				</h1>
			) : (
				<div className="grid grid-cols-3 gap-6">
					<div>&nbsp;</div>
					<h1 className="text-2xl font-bold text-center">
						{selectedCharacter?.name}
					</h1>
					<div className="flex justify-end">
						<Button
							variant="destructive"
							onClick={handleDeleteCharacter}
						>
							Delete Character
						</Button>
					</div>
				</div>
			)}

			<BookView />

			{error && (
				<Alert
					variant="destructive"
					message={error}
					onClose={() => setError(null)}
				/>
			)}
		</div>
	);
}
