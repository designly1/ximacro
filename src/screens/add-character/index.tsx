import { useState, useEffect, use } from 'react';
import SelectMenu from '@/components/select-menu';
import Button from '@/components/button';
import ClearableInput from '@/components/clearable-input';
import ScreenError from '@/components/screen-error';

import { useApp } from '@/contexts/app-provider';

export default function AddCharacterScreen() {
	const {
		ffxiDirectory,
		characters,
		userFolders,
		error,
		setScreen,
		openDialog,
		addCharacter,
	} = useApp();

	const [character, setCharacter] = useState('');
	const [showNewCharacter, setShowNewCharacter] = useState(false);
	const [folder, setFolder] = useState('');

	useEffect(() => {
		if (characters && characters.length > 0) {
			setCharacter(characters[0]);
		} else {
			setCharacter('');
			setShowNewCharacter(true);
		}
	}, [characters]);

	useEffect(() => {
		if (userFolders && userFolders.length > 0) {
			setFolder(userFolders[0]);
		}
	}, [userFolders]);

	if (!ffxiDirectory || !characters || !userFolders) return null;

	const options = characters.map(char => ({ label: char, value: char }));
	options.push({ label: 'Not Listed', value: 'new' });

	const handleCharacterChange = (char: string) => {
		if (char === 'new') {
			setCharacter('');
			setShowNewCharacter(true);
		} else {
			setCharacter(char);
		}
	};

	const handleNewCharacterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCharacter(value);
	};

	const handleSaveCharacter = () => {
		if (!character) {
			openDialog({
				title: 'Error',
				message: 'Character name cannot be empty.',
			});
			return;
		}

		if (!folder) {
			openDialog({
				title: 'Error',
				message: 'Please select a folder.',
			});
			return;
		}

		const result = addCharacter({ name: character, folder });
		if (result !== true) {
			openDialog({
				title: 'Error',
				message: result as string,
			});
			return;
		}

		setScreen('main');
	};

	if (error) {
		return <ScreenError message={error} />;
	}

	return (
		<div className="flex flex-col gap-4 p-4 mx-auto flex-1 w-[90%] max-w-5xl bg-white/45 overflow-y-auto">
			<h1 className="text-2xl font-bold text-center">Add Character Screen</h1>
			<div className="flex flex-col gap-4 w-full">
				<div className="flex flex-col gap-2 w-full">
					<label className="font-bold text-sm">Character Name</label>
					{!showNewCharacter ? (
						<SelectMenu
							label=""
							options={options}
							onChange={handleCharacterChange}
						/>
					) : (
						<ClearableInput
							placeholder="Character Name"
							value={character}
							onChange={handleNewCharacterChange}
							onClear={() => setShowNewCharacter(false)}
						/>
					)}
				</div>
				<SelectMenu
					label="User Folder"
					options={userFolders.map(folder => ({
						label: folder,
						value: folder,
					}))}
					onChange={folder => setFolder(folder)}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button
					variant="success"
					onClick={handleSaveCharacter}
				>
					Save
				</Button>
			</div>
		</div>
	);
}
