// Layout components
import Header from './header';
import Footer from './footer';

// Screens
import MainScreen from '@/screens/main';
import SettingsScreen from '@/screens/settings';
import AddCharacterScreen from '@/screens/add-character';
import CharacterScreen from '@/screens/character';

// Modals
import Dialog from '@/components/dialog';

import { useApp } from '@/contexts/app-provider';

export default function Layout() {
	const { screen, dialog } = useApp();

	return (
		<div
			id="main"
			className="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(231,231,231)] to-[rgb(110,110,110)]"
		>
			<Header />
			<div
				id="main-content"
				className="flex-1 flex flex-col p-8"
			>
				{
					{
						main: <MainScreen />,
						settings: <SettingsScreen />,
						'add-character': <AddCharacterScreen />,
						character: <CharacterScreen />,
					}[screen]
				}
			</div>
			<Footer />
			{dialog && <Dialog />}
		</div>
	);
}
