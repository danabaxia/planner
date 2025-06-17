'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps {
  size?: ContainerSize;
  padding?: ContainerPadding;
  centered?: boolean;
  fluid?: boolean;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-4 py-2',
  md: 'px-6 py-4',
  lg: 'px-8 py-6',
  xl: 'px-12 py-8',
};

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  padding = 'md',
  centered = true,
  fluid = false,
  className,
  children,
  as: Component = 'div',
}) => {
  const containerClasses = cn(
    'w-full',
    {
      'mx-auto': centered,
      'max-w-none': fluid,
    },
    !fluid && sizeClasses[size],
    paddingClasses[padding],
    className
  );

  return (
    <Component className={containerClasses}>
      {children}
    </Component>
  );
};

// Responsive Container that adapts to screen size
export interface ResponsiveContainerProps {
  sizes?: Partial<Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', ContainerSize>>;
  padding?: ContainerPadding;
  centered?: boolean;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  sizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
  },
  padding = 'md',
  centered = true,
  className,
  children,
  as: Component = 'div',
}) => {
  const responsiveClasses = cn(
    'w-full',
    {
      'mx-auto': centered,
    },
    // Apply responsive max-widths
    sizes.sm && `sm:${sizeClasses[sizes.sm]}`,
    sizes.md && `md:${sizeClasses[sizes.md]}`,
    sizes.lg && `lg:${sizeClasses[sizes.lg]}`,
    sizes.xl && `xl:${sizeClasses[sizes.xl]}`,
    sizes['2xl'] && `2xl:${sizeClasses[sizes['2xl']]}`,
    paddingClasses[padding],
    className
  );

  return (
    <Component className={responsiveClasses}>
      {children}
    </Component>
  );
};

// Section Container for page sections
export interface SectionContainerProps {
  size?: ContainerSize;
  padding?: ContainerPadding;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'neutral' | 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
  id?: string;
}

const spacingClasses = {
  none: '',
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-24',
};

const backgroundClasses = {
  none: '',
  neutral: 'bg-neutral-50',
  primary: 'bg-primary-50',
  secondary: 'bg-secondary-50',
};

export const SectionContainer: React.FC<SectionContainerProps> = ({
  size = 'xl',
  padding = 'md',
  spacing = 'md',
  background = 'none',
  className,
  children,
  id,
}) => {
  return (
    <section
      id={id}
      className={cn(
        'w-full',
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
    >
      <Container size={size} padding={padding}>
        {children}
      </Container>
    </section>
  );
};

// Content Container for main content areas
export interface ContentContainerProps {
  sidebar?: boolean;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const sidebarWidthClasses = {
  sm: 'lg:pl-64',
  md: 'lg:pl-80',
  lg: 'lg:pl-96',
};

export const ContentContainer: React.FC<ContentContainerProps> = ({
  sidebar = false,
  sidebarWidth = 'md',
  className,
  children,
}) => {
  return (
    <main
      className={cn(
        'flex-1 min-h-screen',
        {
          [sidebarWidthClasses[sidebarWidth]]: sidebar,
        },
        className
      )}
    >
      {children}
    </main>
  );
};

// Page Container for full page layouts
export interface PageContainerProps {
  header?: boolean;
  footer?: boolean;
  sidebar?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  header = true,
  footer = true,
  sidebar = false,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        {
          'lg:flex-row': sidebar,
        },
        className
      )}
    >
      {children}
    </div>
  );
}; 