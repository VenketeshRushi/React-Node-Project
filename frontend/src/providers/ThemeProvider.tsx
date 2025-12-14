import { useEffect, useState } from "react";
import {
	ThemeContext,
	type Theme,
	type ThemeContextType,
} from "@/providers/contexts/ThemeContext";

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
	attribute?: string;
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "app-ui-theme",
	attribute,
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window !== "undefined") {
			return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
		}
		return defaultTheme;
	});

	const applyTheme = (activeTheme: Theme) => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");
		if (attribute) root.removeAttribute(attribute);

		let finalTheme = activeTheme;
		if (activeTheme === "system") {
			finalTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}

		root.classList.add(finalTheme);
		if (attribute) root.setAttribute(attribute, finalTheme);
	};

	useEffect(() => {
		if (typeof window === "undefined") return;

		applyTheme(theme);

		if (theme !== "system") return;

		const handler = (e: MediaQueryListEvent) =>
			applyTheme(e.matches ? "dark" : "light");

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		media.addEventListener("change", handler);
		return () => media.removeEventListener("change", handler);
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		localStorage.setItem(storageKey, newTheme);
		setThemeState(newTheme);
	};

	const value: ThemeContextType = { theme, setTheme };

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
