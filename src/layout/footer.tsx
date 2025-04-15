import { cn } from '@/lib/utils';

import { FaPaypal } from 'react-icons/fa6';

interface FooterLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
}

function FooterLink({ href, children, className }: FooterLinkProps) {
	const classes = cn(
		'text-gray-600 hover:text-gray-800 flex items-center gap-2 border-r border-gray-400 px-2 [&:last-of-type]:border-r-0',
		className,
	);
	return (
		<button
			className={classes}
			onClick={() => window.open(href, '_blank')}
		>
			{children}
		</button>
	);
}

export default function Footer() {
	return (
		<footer className="bg-gradient-to-t from-gray-400 to-gray-300 flex justify-center items-center px-4 py-3 text-sm fixed bottom-0 left-0 right-0 z-50">
			<FooterLink href="https://1337707.xyz">
				&copy; {new Date().getFullYear()} Jay Simons
			</FooterLink>
			<FooterLink href="https://www.paypal.com/donate/?hosted_button_id=BVYSWFYJXTWS4">
				<FaPaypal className="size-4" /> Donate
			</FooterLink>
		</footer>
	);
}
