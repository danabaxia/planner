import React from 'react';

interface SkipLinkProps {
  /** The ID of the target element */
  targetId: string;
  /** The label for the skip link */
  label: string;
  /** Optional description of the target section */
  description?: string;
  /** Click handler for the skip link */
  onClick: (targetId: string) => void;
}

/**
 * Component to render a skip link for keyboard navigation
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label,
  description,
  onClick,
}) => {
  return (
    <a
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        onClick(targetId);
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-primary-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={description ? `Skip to ${label}: ${description}` : `Skip to ${label}`}
    >
      Skip to {label}
    </a>
  );
}; 