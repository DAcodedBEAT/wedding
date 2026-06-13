import { useState } from "react";

type SearchBoxProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  "aria-label"?: string;
};

/** Large, mobile-friendly search field with a gold focus glow. */
export function SearchBox({ value, onChange, placeholder = "Search…", ...rest }: SearchBoxProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`group relative flex items-center rounded-full border bg-ivory-50/80 px-5 py-4 backdrop-blur-md transition-all duration-300 ${
        focused
          ? "border-gold/70 shadow-[0_0_0_4px_rgba(205,168,106,0.16),0_12px_30px_-14px_rgba(60,45,80,0.5)]"
          : "border-gold/30 shadow-card"
      }`}
    >
      <svg
        className={`mr-3 h-5 w-5 shrink-0 transition-colors ${focused ? "text-gold" : "text-lilac-500"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </svg>
      <input
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent font-sans text-base text-ink placeholder:text-lilac-400/80 focus:outline-none"
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="ml-2 shrink-0 rounded-full p-1 text-lilac-500 transition-colors hover:text-gold"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
