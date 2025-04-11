import { extractMacroNumber } from '@/lib/format';

import { cn } from '@/lib/utils';

import type { MacroItem } from '@/contexts/app-provider';

interface MacroListProps {
	macro: MacroItem;
	bookIndex: number;
	onClick: () => void;
	isSelected: boolean;
}

export default function MacroListItem(props: MacroListProps) {
	const { macro, bookIndex, onClick, isSelected } = props;

	const subtract = bookIndex * 10;

	if (!macro) return null;

	const macroNumber = extractMacroNumber(macro.fileName);

	return (
		<div
			onClick={onClick}
			className={cn(
				'p-4 bg-white/40 rounded-lg cursor-pointer hover:bg-white/60 transition-colors duration-200',
				isSelected && 'bg-blue-500 text-white hover:bg-blue-400',
			)}
		>
			<h3 className="text-lg font-medium">Page {macroNumber - subtract + 1}</h3>
		</div>
	);
}
