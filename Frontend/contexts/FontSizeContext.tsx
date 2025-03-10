import { useState, useContext, createContext, ReactNode } from "react";

interface FontSizeContextType {
    fontScale: number;
    setFontScale: (fontScale: number) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
    fontScale: 100, // This should never fall back to default, this lets it be detected easily
    setFontScale: (fontScale: number) => {}
});

export const FontSizeProvider:React.FC<{children:ReactNode}> = ({ children }) => {
    const [fontScale, setFontScale] = useState(1); // Default font scale is 1, this default is less bad, but may want to make sure a new value is read in from user settings
    return (
        <FontSizeContext.Provider value={{ fontScale, setFontScale }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => useContext(FontSizeContext);