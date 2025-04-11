import React from 'react';
import Alert from '../components/alert';

interface Props {
	title?: string;
	message: string;
}

export default function ScreenError({ title = 'Error', message }: Props) {
	return (
		<div className="mx-auto">
			<Alert
				message={message}
				variant="destructive"
			/>
		</div>
	);
}
