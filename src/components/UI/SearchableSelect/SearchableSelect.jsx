import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import styles from "./SearchableSelect.module.css";

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredOptions = useMemo(() => {
    return options
      .filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 15);
  }, [options, search]);

  const selectedOption = options.find(
    (opt) => opt.id === value || opt.id === Number(value),
  );

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectBox} onClick={() => setIsOpen(!isOpen)}>
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={16} className={isOpen ? styles.rotate : ""} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchContainer}>
            <Search size={14} />
            <input
              autoFocus
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.optionsList}>
            <div
              className={styles.option}
              onClick={() => {
                onChange("");
                setIsOpen(false);
                setSearch("");
              }}
            >
              None
            </div>
            {filteredOptions.map((opt) => (
              <div
                key={opt.id}
                className={`${styles.option} ${value === opt.id ? styles.selected : ""}`}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                {opt.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
