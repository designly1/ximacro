import React from 'react';
import Button from '../components/button';

import { useApp } from '../contexts/app-provider';

export default function Dialog() {
	const { dialog, closeDialog } = useApp();
	if (!dialog) return null;

	const { title, message, onConfirm, onCancel, confirmLabel, cancelLabel } = dialog;

	const handleConfirm = () => {
		onConfirm && onConfirm();
		closeDialog();
	};

	const handleCancel = () => {
		onCancel && onCancel();
		closeDialog();
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
				<h2 className="text-xl font-bold mb-4">{title}</h2>
				<p className="mb-6">{message}</p>
				<div className="flex justify-end gap-2">
					<Button onClick={handleConfirm}>{confirmLabel || 'OK'}</Button>
					<Button
						variant="muted"
						onClick={handleCancel}
					>
						{cancelLabel || 'Cancel'}
					</Button>
				</div>
			</div>
		</div>
	);
}
