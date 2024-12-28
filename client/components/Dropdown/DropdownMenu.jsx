import PropTypes from 'prop-types';
import React, {
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect
} from 'react';
import styled from 'styled-components';
import useModalClose from '../../common/useModalClose';
import DownArrowIcon from '../../images/down-filled-triangle.svg';
// Import MenuItem directly instead of from Dropdown index
import MenuItem from './MenuItem';
import { DropdownWrapper } from '../Dropdown';

// Now MenuItem is available for styling
const StyledMenuItem = styled(MenuItem)`
  /* Remove ALL outlines and focus styles */
  outline: none !important;
  &:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  &:focus-visible {
    outline: none !important;
  }

  /* Single source of truth for selection styling */
  &[data-selected='true'] {
    background-color: ${({ theme }) => theme.colors.golden};
    outline: 2px solid ${({ theme }) => theme.colors.primary} !important;
    outline-offset: -2px;
    position: relative;
    z-index: 1;
  }

  /* Only show hover effect when not selected */
  &:hover:not([data-selected='true']) {
    background-color: ${({ theme }) => theme.colors.golden};
  }
`;

const StyledButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary}; // Changed from button.active
  }
`;

const DropdownMenu = forwardRef(
  ({ items, anchor, 'aria-label': ariaLabel, align, className }, ref) => {
    const focusedRef = useRef(false);
    const menuRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isOpen, setIsOpen] = useState(false);

    const close = useCallback(() => setIsOpen(false), [setIsOpen]);

    const anchorRef = useModalClose(close, ref);

    const toggle = useCallback(() => {
      setIsOpen((prevState) => !prevState);
    }, [setIsOpen]);

    const handleFocus = () => {
      focusedRef.current = true;
    };

    const handleBlur = () => {
      focusedRef.current = false;
      setTimeout(() => {
        if (!focusedRef.current) {
          close();
        }
      }, 200);
    };

    useEffect(() => {
      if (isOpen) {
        const menuItems = menuRef.current?.querySelectorAll(
          '[role="menuitem"]'
        );
        if (menuItems?.length) {
          setActiveIndex(-1); // Start with no active item
        }
      }
    }, [isOpen]);

    const handleItemAction = useCallback(
      (itemData) => {
        if (itemData.href) return;

        if (itemData.onClick) {
          try {
            itemData.onClick();
          } catch (err) {
            console.error('Error executing onClick:', err);
          }
        }
        close();
      },
      [close]
    );

    const focusItem = useCallback((idx) => {
      const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
      if (!menuItems?.length) return;

      const item = menuItems[idx];
      if (item) {
        // Set active first, then focus
        setActiveIndex(idx);
        requestAnimationFrame(() => {
          item.focus({ preventScroll: true });
        });
      }
    }, []);

    const handleKeyDown = useCallback(
      (e) => {
        if (!isOpen) return undefined;

        // Get only visible items (not hidden by hideIf)
        const visibleItems = items.filter((item) => !item.hideIf);
        const maxIndex = visibleItems.length - 1;

        const menuItems = menuRef.current?.querySelectorAll(
          '[role="menuitem"]'
        );
        if (!menuItems?.length) return undefined;

        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault();
            e.stopPropagation();
            // Only increment if we're not at the end
            if (activeIndex === -1) {
              focusItem(0);
            } else if (activeIndex < maxIndex) {
              focusItem(activeIndex + 1);
            }
            return undefined;
          }

          case 'ArrowUp': {
            e.preventDefault();
            e.stopPropagation();
            // Only decrement if we're not at the start
            if (activeIndex === -1) {
              focusItem(maxIndex);
            } else if (activeIndex > 0) {
              focusItem(activeIndex - 1);
            }
            return undefined;
          }

          case 'Enter':
          case ' ': {
            e.preventDefault();
            e.stopPropagation();
            if (activeIndex >= 0 && activeIndex < items.length) {
              const currentItem = items[activeIndex];
              if (!currentItem.hideIf) {
                handleItemAction(currentItem);
              }
            }
            return undefined;
          }

          case 'Home': {
            e.preventDefault();
            focusItem(0);
            return undefined;
          }

          case 'End': {
            e.preventDefault();
            focusItem(menuItems.length - 1);
            return undefined;
          }

          case 'Escape': {
            e.preventDefault();
            close();
            return undefined;
          }

          default:
            return undefined;
        }
      },
      [isOpen, close, activeIndex, handleItemAction, items, focusItem]
    );

    useEffect(() => {
      console.log('activeIndex changed:', activeIndex);
    }, [activeIndex]);

    useEffect(() => {
      if (!isOpen) {
        setActiveIndex(-1);
        return;
      }

      document.addEventListener('keydown', handleKeyDown, true);

      // eslint-disable-next-line consistent-return
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, handleKeyDown]);

    const renderMenuItem = (item, index) => {
      if (item.hideIf) return null;

      const itemProps = item.href
        ? {
            as: 'a',
            href: item.href,
            target: item.target,
            rel: item.target === '_blank' ? 'noopener noreferrer' : undefined,
            onClick: () => close()
          }
        : {
            onClick: () => handleItemAction(item)
          };

      return (
        <StyledMenuItem
          key={item.name}
          {...itemProps}
          onKeyDown={(e) => e.stopPropagation()}
          role="menuitem"
          tabIndex="-1"
          data-selected={index === activeIndex}
        >
          {item.name}
        </StyledMenuItem>
      );
    };

    return (
      <div ref={anchorRef} className={className} aria-haspopup="menu">
        <StyledButton
          aria-label={ariaLabel}
          tabIndex="0"
          onClick={toggle}
          onBlur={handleBlur}
          onFocus={handleFocus}
        >
          {anchor ?? <DownArrowIcon focusable="false" aria-hidden="true" />}
        </StyledButton>
        {isOpen && (
          <DropdownWrapper
            ref={menuRef}
            role="menu"
            align={align}
            onMouseUp={() => {
              setTimeout(close, 0);
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
          >
            {items.map(renderMenuItem)}
          </DropdownWrapper>
        )}
      </div>
    );
  }
);

DropdownMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      href: PropTypes.string,
      target: PropTypes.string,
      hideIf: PropTypes.bool
    }).isRequired
  ).isRequired,
  anchor: PropTypes.node,
  'aria-label': PropTypes.string.isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string
};

DropdownMenu.defaultProps = {
  anchor: null,
  align: 'right',
  className: ''
};

export default DropdownMenu;
