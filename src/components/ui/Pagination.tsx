'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

type MotionNavProps = Omit<HTMLMotionProps<'nav'>, 'children'>;

export interface PaginationProps extends MotionNavProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Number of pages to show around current page */
  siblingCount?: number;
  /** Show first/last page buttons */
  showFirstLast?: boolean;
  /** Show previous/next page buttons */
  showPrevNext?: boolean;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Available page sizes */
  pageSizes?: number[];
  /** Current page size */
  pageSize?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const DOTS = '...';

const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      siblingCount = 1,
      showFirstLast = true,
      showPrevNext = true,
      showPageSize = false,
      pageSizes = [10, 20, 50, 100],
      pageSize = 10,
      onPageChange,
      onPageSizeChange,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const getPageNumbers = () => {
      const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last
      const totalBlocks = totalNumbers + 2; // total numbers + 2 DOTS

      if (totalPages <= totalBlocks) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        return [
          ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
          DOTS,
          totalPages,
        ];
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        return [
          1,
          DOTS,
          ...Array.from(
            { length: rightItemCount },
            (_, i) => totalPages - rightItemCount + i + 1
          ),
        ];
      }

      return [
        1,
        DOTS,
        ...Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        ),
        DOTS,
        totalPages,
      ];
    };

    const pages = getPageNumbers();

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange?.(page);
      }
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(event.target.value);
      onPageSizeChange?.(newSize);
    };

    const buttonClasses = (isActive: boolean) =>
      cn(
        'relative inline-flex items-center justify-center',
        'min-w-[2.5rem] h-10 px-3 py-2 text-sm',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'bg-primary-500 text-white': isActive,
          'hover:bg-neutral-100': !isActive,
        }
      );

    return (
      <motion.nav
        ref={ref}
        aria-label="Pagination"
        className={cn('flex flex-wrap items-center gap-4', className)}
        variants={formField}
        initial="hidden"
        animate="visible"
        {...containerMotionProps}
        {...props}
      >
        {showPageSize && (
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-neutral-500">
              Items per page:
            </label>
            <select
              id="pageSize"
              className={cn(
                'h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20'
              )}
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {pageSizes.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          {showFirstLast && (
            <motion.button
              type="button"
              className={buttonClasses(false)}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              whileTap={{ scale: 0.95 }}
              title="First page"
            >
              <span className="sr-only">First page</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </motion.button>
          )}

          {showPrevNext && (
            <motion.button
              type="button"
              className={buttonClasses(false)}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              whileTap={{ scale: 0.95 }}
              title="Previous page"
            >
              <span className="sr-only">Previous page</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
          )}

          {pages.map((page, index) => {
            if (page === DOTS) {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex h-10 items-end px-2 text-neutral-500"
                  aria-hidden="true"
                >
                  {DOTS}
                </span>
              );
            }

            return (
              <motion.button
                key={page}
                type="button"
                className={buttonClasses(page === currentPage)}
                onClick={() => handlePageChange(page as number)}
                disabled={page === currentPage}
                whileTap={{ scale: 0.95 }}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </motion.button>
            );
          })}

          {showPrevNext && (
            <motion.button
              type="button"
              className={buttonClasses(false)}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              whileTap={{ scale: 0.95 }}
              title="Next page"
            >
              <span className="sr-only">Next page</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          )}

          {showFirstLast && (
            <motion.button
              type="button"
              className={buttonClasses(false)}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              whileTap={{ scale: 0.95 }}
              title="Last page"
            >
              <span className="sr-only">Last page</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          )}
        </div>

        <div className="text-sm text-neutral-500">
          Page {currentPage} of {totalPages}
        </div>
      </motion.nav>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination }; 