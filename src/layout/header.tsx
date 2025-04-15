import Button from '@/components/button';
import { useApp } from '@/contexts/app-provider';
import moogle from '@/svg/icon.svg';
import { FaPaypal, FaArrowAltCircleLeft } from 'react-icons/fa';
import { FaDatabase } from 'react-icons/fa6';
import { MdOutlineSettingsInputComponent } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { HiMenu } from 'react-icons/hi';

export default function Header() {
	const { screen, setScreen, backButtonCallback } = useApp();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.menu-container') && !target.closest('.menu-button')) {
				setIsMenuOpen(false);
			}
		};

		if (isMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMenuOpen]);

	const handleSettingsButton = () => {
		if (backButtonCallback) {
			console.log('backButtonCallback', backButtonCallback);
			backButtonCallback();
		} else {
			console.log('ef');
			setScreen(screen === 'main' ? 'settings' : 'main');
		}
		setIsMenuOpen(false);
	};

	const handlePaypalButton = () => {
		window.open(
			'https://www.paypal.com/donate/?hosted_button_id=BVYSWFYJXTWS4',
			'_blank',
		);
	};

	return (
		<header className="bg-white/40 flex flex-row justify-between items-center px-8 py-2 relative">
			<div className="flex items-center justify-center gap-4">
				<img
					src={moogle}
					alt="Moogle"
					className="w-[50px] h-[50px]"
				/>
				<h1 className="text-2xl text-[#333]">XIMACRO</h1>
			</div>
			<div className="flex items-center gap-6">
				<Button onClick={handlePaypalButton}>
					<FaPaypal className="size-4" />
					<span>Donate :)</span>
				</Button>
				<button
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					className="menu-button"
				>
					<HiMenu className="size-11" />
				</button>
			</div>
			{isMenuOpen && (
				<>
					<div className="fixed inset-0 z-40" />
					<div className="absolute right-6 top-full mt-2 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2 min-w-[200px] z-50 menu-container">
						<Button
							onClick={() => {
								setScreen('export-import');
								setIsMenuOpen(false);
							}}
							variant="success"
						>
							<FaDatabase className="size-4" />
							<span>Export/Import</span>
						</Button>
						<Button onClick={handleSettingsButton}>
							{screen === 'main' ? (
								<>
									<MdOutlineSettingsInputComponent className="size-4" />
									<span>Settings</span>
								</>
							) : (
								<>
									<FaArrowAltCircleLeft className="size-4" />
									<span>Back</span>
								</>
							)}
						</Button>
					</div>
				</>
			)}
		</header>
	);
}
