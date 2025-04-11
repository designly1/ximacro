import Button from '@/components/button';
import ScreenError from '@/components/screen-error';
import CharacterButton from '@/components/character-button';
import Alert from '@/components/alert';

import { useApp } from '@/contexts/app-provider';

export default function MainScreen() {
	const { userCharacters, ffxiDirectory, setScreen, setSelectedCharacter } = useApp();

	if (!ffxiDirectory) {
		return (
			<ScreenError message="Please set the FFXI directory in the settings screen." />
		);
	}

	const handleCharacterClick = (name: string) => {
		const char = userCharacters.find(char => char.name === name);
		if (char) {
			setSelectedCharacter(char);
			setScreen('character');
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4 mx-auto flex-1 w-[90%] max-w-5xl bg-white/45 overflow-y-auto">
			<h1 className="text-2xl font-bold text-center">Character List</h1>

			<div className="flex flex-col gap-4 w-full">
				{userCharacters.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{userCharacters.map((char, i) => (
							<CharacterButton
								key={i}
								index={i}
								name={char.name}
								onClick={() => handleCharacterClick(char.name)}
							/>
						))}
					</div>
				) : (
					<Alert message="No characters found. Click 'Add Character' to add a new character." />
				)}
			</div>
			<div className="flex justify-end gap-2 mt-auto">
				<Button
					variant="success"
					onClick={() => setScreen('add-character')}
				>
					Add Character
				</Button>
			</div>
		</div>
	);
}
