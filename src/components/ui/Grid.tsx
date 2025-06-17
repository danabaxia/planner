'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface GridProps {
  cols?: GridCols;
  gap?: GridGap;
  align?: GridAlign;
  justify?: GridJustify;
  responsive?: {
    sm?: GridCols;
    md?: GridCols;
    lg?: GridCols;
    xl?: GridCols;
    '2xl'?: GridCols;
  };
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const gapClasses = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  responsive,
  className,
  children,
  as: Component = 'div',
}) => {
  const gridClasses = cn(
    'grid',
    colsClasses[cols],
    gapClasses[gap],
    alignClasses[align],
    justifyClasses[justify],
    // Responsive columns
    responsive?.sm && `sm:grid-cols-${responsive.sm}`,
    responsive?.md && `md:grid-cols-${responsive.md}`,
    responsive?.lg && `lg:grid-cols-${responsive.lg}`,
    responsive?.xl && `xl:grid-cols-${responsive.xl}`,
    responsive?.['2xl'] && `2xl:grid-cols-${responsive['2xl']}`,
    className
  );

  return (
    <Component className={gridClasses}>
      {children}
    </Component>
  );
};

// Grid Item component for individual grid cells
export interface GridItemProps {
  span?: GridCols;
  start?: GridCols;
  end?: GridCols;
  rowSpan?: number;
  rowStart?: number;
  rowEnd?: number;
  responsive?: {
    sm?: { span?: GridCols; start?: GridCols; end?: GridCols };
    md?: { span?: GridCols; start?: GridCols; end?: GridCols };
    lg?: { span?: GridCols; start?: GridCols; end?: GridCols };
    xl?: { span?: GridCols; start?: GridCols; end?: GridCols };
    '2xl'?: { span?: GridCols; start?: GridCols; end?: GridCols };
  };
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const spanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

const startClasses = {
  1: 'col-start-1',
  2: 'col-start-2',
  3: 'col-start-3',
  4: 'col-start-4',
  5: 'col-start-5',
  6: 'col-start-6',
  7: 'col-start-7',
  8: 'col-start-8',
  9: 'col-start-9',
  10: 'col-start-10',
  11: 'col-start-11',
  12: 'col-start-12',
};

const endClasses = {
  1: 'col-end-1',
  2: 'col-end-2',
  3: 'col-end-3',
  4: 'col-end-4',
  5: 'col-end-5',
  6: 'col-end-6',
  7: 'col-end-7',
  8: 'col-end-8',
  9: 'col-end-9',
  10: 'col-end-10',
  11: 'col-end-11',
  12: 'col-end-12',
};

export const GridItem: React.FC<GridItemProps & Omit<React.HTMLAttributes<HTMLElement>, 'as'>> = ({
  span,
  start,
  end,
  rowSpan,
  rowStart,
  rowEnd,
  responsive,
  className,
  children,
  as: Component = 'div',
  ...rest
}) => {
  const itemClasses = cn(
    // Column span
    span && spanClasses[span],
    start && startClasses[start],
    end && endClasses[end],
    // Row span
    rowSpan && `row-span-${rowSpan}`,
    rowStart && `row-start-${rowStart}`,
    rowEnd && `row-end-${rowEnd}`,
    // Responsive column spans
    responsive?.sm?.span && `sm:col-span-${responsive.sm.span}`,
    responsive?.sm?.start && `sm:col-start-${responsive.sm.start}`,
    responsive?.sm?.end && `sm:col-end-${responsive.sm.end}`,
    responsive?.md?.span && `md:col-span-${responsive.md.span}`,
    responsive?.md?.start && `md:col-start-${responsive.md.start}`,
    responsive?.md?.end && `md:col-end-${responsive.md.end}`,
    responsive?.lg?.span && `lg:col-span-${responsive.lg.span}`,
    responsive?.lg?.start && `lg:col-start-${responsive.lg.start}`,
    responsive?.lg?.end && `lg:col-end-${responsive.lg.end}`,
    responsive?.xl?.span && `xl:col-span-${responsive.xl.span}`,
    responsive?.xl?.start && `xl:col-start-${responsive.xl.start}`,
    responsive?.xl?.end && `xl:col-end-${responsive.xl.end}`,
    responsive?.['2xl']?.span && `2xl:col-span-${responsive['2xl'].span}`,
    responsive?.['2xl']?.start && `2xl:col-start-${responsive['2xl'].start}`,
    responsive?.['2xl']?.end && `2xl:col-end-${responsive['2xl'].end}`,
    className
  );

  return (
    <Component className={itemClasses} {...(rest as any)}>
      {children}
    </Component>
  );
};

// Flex component for flexbox layouts
export interface FlexProps {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: GridGap;
  responsive?: {
    sm?: { direction?: FlexProps['direction']; wrap?: FlexProps['wrap'] };
    md?: { direction?: FlexProps['direction']; wrap?: FlexProps['wrap'] };
    lg?: { direction?: FlexProps['direction']; wrap?: FlexProps['wrap'] };
    xl?: { direction?: FlexProps['direction']; wrap?: FlexProps['wrap'] };
    '2xl'?: { direction?: FlexProps['direction']; wrap?: FlexProps['wrap'] };
  };
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
};

const wrapClasses = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const flexAlignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const flexJustifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  wrap = 'nowrap',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  responsive,
  className,
  children,
  as: Component = 'div',
}) => {
  const flexClasses = cn(
    'flex',
    directionClasses[direction],
    wrapClasses[wrap],
    flexAlignClasses[align],
    flexJustifyClasses[justify],
    gapClasses[gap],
    // Responsive direction and wrap
    responsive?.sm?.direction && `sm:${directionClasses[responsive.sm.direction]}`,
    responsive?.sm?.wrap && `sm:${wrapClasses[responsive.sm.wrap]}`,
    responsive?.md?.direction && `md:${directionClasses[responsive.md.direction]}`,
    responsive?.md?.wrap && `md:${wrapClasses[responsive.md.wrap]}`,
    responsive?.lg?.direction && `lg:${directionClasses[responsive.lg.direction]}`,
    responsive?.lg?.wrap && `lg:${wrapClasses[responsive.lg.wrap]}`,
    responsive?.xl?.direction && `xl:${directionClasses[responsive.xl.direction]}`,
    responsive?.xl?.wrap && `xl:${wrapClasses[responsive.xl.wrap]}`,
    responsive?.['2xl']?.direction && `2xl:${directionClasses[responsive['2xl'].direction]}`,
    responsive?.['2xl']?.wrap && `2xl:${wrapClasses[responsive['2xl'].wrap]}`,
    className
  );

  return (
    <Component className={flexClasses}>
      {children}
    </Component>
  );
};

// Flex Item component for individual flex items
export interface FlexItemProps {
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: 'auto' | 'full' | 'px' | string;
  order?: number;
  align?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const FlexItem: React.FC<FlexItemProps> = ({
  grow,
  shrink,
  basis,
  order,
  align,
  className,
  children,
  as: Component = 'div',
}) => {
  const itemClasses = cn(
    // Flex grow
    grow === true && 'flex-grow',
    grow === false && 'flex-grow-0',
    typeof grow === 'number' && `flex-grow-${grow}`,
    // Flex shrink
    shrink === true && 'flex-shrink',
    shrink === false && 'flex-shrink-0',
    typeof shrink === 'number' && `flex-shrink-${shrink}`,
    // Flex basis
    basis === 'auto' && 'basis-auto',
    basis === 'full' && 'basis-full',
    basis === 'px' && 'basis-px',
    // Order
    order && `order-${order}`,
    // Self alignment
    align === 'auto' && 'self-auto',
    align === 'start' && 'self-start',
    align === 'center' && 'self-center',
    align === 'end' && 'self-end',
    align === 'stretch' && 'self-stretch',
    align === 'baseline' && 'self-baseline',
    className
  );

  return (
    <Component className={itemClasses}>
      {children}
    </Component>
  );
};

// Stack component for vertical layouts
export interface StackProps {
  spacing?: GridGap;
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const Stack: React.FC<StackProps> = ({
  spacing = 'md',
  align = 'stretch',
  className,
  children,
  as: Component = 'div',
}) => {
  return (
    <Flex
      direction="col"
      align={align}
      gap={spacing}
      className={className}
      as={Component}
    >
      {children}
    </Flex>
  );
};

// Inline component for horizontal layouts
export interface InlineProps {
  spacing?: GridGap;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const Inline: React.FC<InlineProps> = ({
  spacing = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className,
  children,
  as: Component = 'div',
}) => {
  return (
    <Flex
      direction="row"
      align={align}
      justify={justify}
      wrap={wrap ? 'wrap' : 'nowrap'}
      gap={spacing}
      className={className}
      as={Component}
    >
      {children}
    </Flex>
  );
}; 