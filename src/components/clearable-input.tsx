import React from 'react';

import { cn } from '@/lib/utils';

interface ClearableInputProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onClear: () => void;
	placeholder?: string;
	disabled?: boolean;
	showButtonWhenEmpty?: boolean;
	maxLength?: number;
	className?: string;
}

export default function ClearableInput({
	value,
	onChange,
	onClear,
	placeholder = 'Enter text...',
	disabled = false,
	showButtonWhenEmpty = true,
	maxLength = 1000,
	className,
}: ClearableInputProps) {
	return (
		<div className={cn('relative flex items-center w-full', className)}>
			<input
				type="text"
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				disabled={disabled}
				className="w-full p-2 border border-white/60 rounded bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed pr-8"
				maxLength={maxLength}
			/>
			{(showButtonWhenEmpty || value) && (
				<button
					type="button"
					className="absolute right-2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={onClear}
					disabled={disabled}
				>
					&times;
				</button>
			)}
		</div>
	);
}
