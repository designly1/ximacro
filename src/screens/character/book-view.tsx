import React, { useEffect, useState, useRef } from 'react';
import Collapse from '@/components/collapse';
import MacroListItem from '@/screens/character/macro-list-item';
import Alert from '@/components/alert';
import MacroGrid from '@/screens/character/macro-grid';
import MacroForm from '@/screens/character/macro-form';

import { useApp } from '@/contexts/app-provider';
import { extractMacroNumber } from '@/lib/format';

import { BiCollapseVertical } from 'react-icons/bi';
import { BsClipboard2CheckFill } from 'react-icons/bs';

import type { MacroItem } from '@/contexts/app-provider';

const PAGES_PER_BOOK = 10;

export default function BookView() {
	const {
		books,
		macros,
		selectedMacro,
		loadBooks,
		loadMacros,
		setSelectedMacro,
		setSelectedMacroIndex,
		setSelectedMacroItem,
		copiedMacro,
		setCopiedMacro,
		setSelectedMacroItemIndex,
		copiedMacroPage,
		setCopiedMacroPage,
	} = useApp();

	const [booksLoaded, setBooksLoaded] = useState(false);
	const [bookPages, setBookPages] = useState<MacroItem[][]>([]);
	const [openIndexes, setOpenIndexes] = useState<number[]>([]);
	const [copiedMacroConfirm, setCopiedMacroConfirm] = useState(false);
	const initialLoadRef = useRef(false);

	const hasOpenIndexes = openIndexes.length > 0;

	useEffect(() => {
		if (!initialLoadRef.current) {
			initialLoadRef.current = true;
			loadBooks().then(() => {
				loadMacros().then(() => {
					setBooksLoaded(true);
				});
			});
		}
	}, []);

	useEffect(() => {
		if (booksLoaded && books.length > 0) {
			const newBookPages: MacroItem[][] = [];

			for (const macro of macros) {
				const macroNumber = extractMacroNumber(macro.fileName);
				const page = Math.floor(macroNumber / PAGES_PER_BOOK);

				// Initialize the page array if it doesn't exist yet
				if (!newBookPages[page]) {
					newBookPages[page] = [];
				}

				newBookPages[page].push(macro);
			}
			setBookPages(newBookPages);
		}
	}, [booksLoaded]);

	const handleMacroClick = (macro: MacroItem) => {
		setSelectedMacro(macro);
		setSelectedMacroIndex(macros.findIndex(m => m.fileName === macro.fileName));
		setSelectedMacroItem(macro.macros[0]);
		setSelectedMacroItemIndex(0);
	};

	const handleCopiedMacroClick = () => {
		if (copiedMacroConfirm) {
			setCopiedMacroConfirm(false);
			setCopiedMacro(null);
		} else {
			setCopiedMacroConfirm(true);
		}
	};

	if (!booksLoaded && (!books || books.length === 0)) return null;
	if (booksLoaded && !Boolean(books.length)) {
		return <Alert message="No books found" />;
	}

	return (
		<>
			<div className="flex flex-col gap-6 p-4">
				{bookPages.map((page, index) => {
					const bookName = books[index];
					const hasSelectedMacro = page.some(
						macro => macro.fileName === selectedMacro?.fileName,
					);
					return (
						<Collapse
							key={index}
							title={bookName}
							openIndexes={openIndexes}
							setOpenIndexes={setOpenIndexes}
							index={index}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{page.map((macro, macroIndex) => (
									<MacroListItem
										key={macroIndex}
										macro={macro}
										onClick={() => handleMacroClick(macro)}
										bookIndex={index}
										isSelected={
											selectedMacro?.fileName === macro.fileName
										}
									/>
								))}
							</div>
							<MacroGrid disabled={!hasSelectedMacro} />
							{hasSelectedMacro && <MacroForm />}
						</Collapse>
					);
				})}
			</div>
			{hasOpenIndexes && (
				<div className="fixed top-0 left-0 right-0 flex items-center justify-center gap-6 z-20">
					{copiedMacro && (
						<div
							className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 px-4 py-2 rounded-b-xl cursor-pointer flex items-center gap-2"
							onClick={handleCopiedMacroClick}
						>
							{copiedMacroConfirm ? (
								<>
									<span className="animate-bounce">
										Tap again to clear
									</span>
								</>
							) : (
								<>
									<BsClipboard2CheckFill />
									<span>Copied Macro</span>
								</>
							)}
						</div>
					)}
					<button
						className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 px-4 py-2 rounded-b-xl cursor-pointer flex items-center gap-2"
						onClick={() => setOpenIndexes([])}
					>
						<BiCollapseVertical />
						Collapse All
					</button>
				</div>
			)}
		</>
	);
}
