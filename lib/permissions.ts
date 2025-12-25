// Simple permission helpers used by client components

export type UserLike = { role?: string | null } | undefined | null;

function roleName(user?: UserLike) {
  return String(user?.role ?? '').trim().toLowerCase();
}

export function canSoftDelete(user?: UserLike): boolean {
  const r = roleName(user);
  return r === 'admin' || r === 'administrator';
}

export function canExport(user?: UserLike): boolean {
  const r = roleName(user);
  // allow admins and accountants to export
  return r === 'admin' || r === 'administrator' || r === 'accountant' || r === 'account';
}

export function canApproveTransaction(user?: UserLike): boolean {
  const r = roleName(user);
  // approving transactions allowed for admin and accountant roles
  return r === 'admin' || r === 'administrator' || r === 'accountant';
}
