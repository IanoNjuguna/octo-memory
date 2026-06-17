import { createElement } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ZapIcon as _ZapIcon,
  Copy01Icon as _Copy01Icon,
  Tick01Icon as _Tick01Icon,
  ExternalLinkIcon as _ExternalLinkIcon,
  StarIcon as _StarIcon,
  Rocket01Icon as _Rocket01Icon,
  ArrowLeft01Icon as _ArrowLeft01Icon,
  RefreshIcon as _RefreshIcon,
  UserIcon as _UserIcon,
  GlobeIcon as _GlobeIcon,
  CodeIcon as _CodeIcon,
  ArrowUpRight01Icon as _ArrowUpRight01Icon,
  Clock01Icon as _Clock01Icon,
  LeftToRightListBulletIcon as _LeftToRightListBulletIcon,
  BookOpen01Icon as _BookOpen01Icon,
  ArrowRight01Icon as _ArrowRight01Icon,
  Wallet01Icon as _Wallet01Icon,
  QrCodeIcon as _QrCodeIcon,
  ScanIcon as _ScanIcon,
  CheckmarkCircle01Icon as _CheckmarkCircle01Icon,
  Alert01Icon as _Alert01Icon,
  CancelCircleIcon as _CancelCircleIcon,
  Loading02Icon as _Loading02Icon,
  Cancel01Icon as _Cancel01Icon,
  Add01Icon as _Add01Icon,
  Delete01Icon as _Delete01Icon,
  ArrowDown01Icon as _ArrowDown01Icon,
  ArrowUp01Icon as _ArrowUp01Icon,
  Logout01Icon as _Logout01Icon,
  UserAdd01Icon as _UserAdd01Icon,
  Download01Icon as _Download01Icon,
  Upload01Icon as _Upload01Icon,
  ViewIcon as _ViewIcon,
  ViewOffIcon as _ViewOffIcon,
  Key01Icon as _Key01Icon,
  Menu01Icon as _Menu01Icon,
  DragIcon as _DragIcon,
  CircleIcon as _CircleIcon,
  MoreHorizontalIcon as _MoreHorizontalIcon,
  Search01Icon as _Search01Icon,
} from '@hugeicons/core-free-icons';

function extractSize(className?: string): number {
  if (!className) return 24;
  const match = className?.match(/h-(\d+)/);
  if (!match) return 24;
  return parseInt(match[1], 10) * 4;
}

function wrap(iconData: unknown) {
  return function WrappedIcon({ className }: { className?: string }) {
    return createElement(HugeiconsIcon, {
      icon: iconData,
      size: extractSize(className),
      strokeWidth: 1.5,
      className,
    });
  };
}

export const ZapIcon = wrap(_ZapIcon);
export const Copy01Icon = wrap(_Copy01Icon);
export const Tick01Icon = wrap(_Tick01Icon);
export const ExternalLinkIcon = wrap(_ExternalLinkIcon);
export const StarIcon = wrap(_StarIcon);
export const Rocket01Icon = wrap(_Rocket01Icon);
export const ArrowLeft01Icon = wrap(_ArrowLeft01Icon);
export const RefreshIcon = wrap(_RefreshIcon);
export const UserIcon = wrap(_UserIcon);
export const GlobeIcon = wrap(_GlobeIcon);
export const CodeIcon = wrap(_CodeIcon);
export const ArrowUpRight01Icon = wrap(_ArrowUpRight01Icon);
export const Clock01Icon = wrap(_Clock01Icon);
export const LeftToRightListBulletIcon = wrap(_LeftToRightListBulletIcon);
export const BookOpen01Icon = wrap(_BookOpen01Icon);
export const ArrowRight01Icon = wrap(_ArrowRight01Icon);
export const Wallet01Icon = wrap(_Wallet01Icon);
export const QrCodeIcon = wrap(_QrCodeIcon);
export const ScanIcon = wrap(_ScanIcon);
export const CheckmarkCircle01Icon = wrap(_CheckmarkCircle01Icon);
export const Alert01Icon = wrap(_Alert01Icon);
export const CancelCircleIcon = wrap(_CancelCircleIcon);
export const Loading02Icon = wrap(_Loading02Icon);
export const Cancel01Icon = wrap(_Cancel01Icon);
export const Add01Icon = wrap(_Add01Icon);
export const Delete01Icon = wrap(_Delete01Icon);
export const ArrowDown01Icon = wrap(_ArrowDown01Icon);
export const ArrowUp01Icon = wrap(_ArrowUp01Icon);
export const Logout01Icon = wrap(_Logout01Icon);
export const UserAdd01Icon = wrap(_UserAdd01Icon);
export const Download01Icon = wrap(_Download01Icon);
export const Upload01Icon = wrap(_Upload01Icon);
export const ViewIcon = wrap(_ViewIcon);
export const ViewOffIcon = wrap(_ViewOffIcon);
export const Key01Icon = wrap(_Key01Icon);
export const Menu01Icon = wrap(_Menu01Icon);
export const DragIcon = wrap(_DragIcon);
export const CircleIcon = wrap(_CircleIcon);
export const MoreHorizontalIcon = wrap(_MoreHorizontalIcon);
export const Search01Icon = wrap(_Search01Icon);