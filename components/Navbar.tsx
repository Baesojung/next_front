'use client';

import { usePathname, useRouter } from 'next/navigation';
import { IconClipboardSmile, IconCoin, IconHome2, IconLogout, IconSwitchHorizontal, IconTable } from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from '@/components/Navbar.module.css';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mainLinks = [
  { icon: IconHome2, label: '홈', href: '/' },
  { icon: IconCoin, label: '모의투자', href: '/paper-trading' },
  { icon: IconTable, label: 'ETF 결과', href: '/paper-trading/results' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = mainLinks.map((link) => (
    <NavbarLink
      icon={link.icon}
      label={link.label}
      key={link.href}
      active={pathname === link.href}
      onClick={() => router.push(link.href)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center>
        <IconClipboardSmile stroke={2} color='#0d47ce'/>
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0} className={classes.bottomActions}>
        <NavbarLink icon={IconSwitchHorizontal} label="Change account" />
        <NavbarLink icon={IconLogout} label="Logout" />
      </Stack>
    </nav>
  );
}
