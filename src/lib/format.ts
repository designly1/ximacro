export const extractMacroNumber = (fileName: string) => {
	const fn = fileName.split('\\').pop() || fileName;
	let macroNumber = 0;
	const match = fn.match(/(\d+)/);
	if (match) {
		macroNumber = Number(match[1] || 1);
	}
	return macroNumber;
};
