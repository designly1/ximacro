import Button from '@/components/button';

import { useApp } from '@/contexts/app-provider';
import moogle from '@/svg/icon.svg';
import pp from '@/svg/pp.svg';
import left from '@/svg/left-arrow.svg';
import cog from '@/svg/cog.svg';

import { FaPaypal, FaArrowAltCircleLeft } from 'react-icons/fa';
import { MdOutlineSettingsInputComponent } from 'react-icons/md';

export default function Header() {
	const { screen, setScreen, backButtonCallback } = useApp();

	const handleSettingsButton = () => {
		if (backButtonCallback) {
			console.log('backButtonCallback', backButtonCallback);
			backButtonCallback();
		} else {
			console.log('ef');
			setScreen(screen === 'main' ? 'settings' : 'main');
		}
	};

	const handlePaypalButton = () => {
		window.open(
			'https://www.paypal.com/donate/?hosted_button_id=BVYSWFYJXTWS4',
			'_blank',
		);
	};

	return (
		<header className="bg-white/40 flex flex-row justify-between items-center px-4 py-2">
			<div className="flex items-center justify-center gap-4">
				<img
					className="w-[50px] h-[50px]"
					src={moogle}
					alt="Moogle"
				/>
				<h1 className="text-2xl text-[#333]">XIMACRO</h1>
			</div>
			<div className="flex items-center gap-2">
				<Button onClick={handlePaypalButton}>
					<FaPaypal className="size-4" />
					<span>Donate :)</span>
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
		</header>
	);
}
