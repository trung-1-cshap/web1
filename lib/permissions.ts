// Simple permission helpers used by client components

export type UserLike = { role?: string | null } | undefined | null;

function roleName(user?: UserLike) {
  return String(user?.role ?? '').trim().toLowerCase();
}

export function canSoftDelete(user?: UserLike): boolean {
  const r = roleName(user);
  return (
    r === 'admin' || r === 'administrator' || r === 'manager'
  );
}

export function canExport(user?: UserLike): boolean {
  const r = roleName(user);
  // allow admins, managers and accountants to export
  return (
    r === 'admin' || r === 'administrator' || r === 'manager' || r === 'accountant' || r === 'account'
  );
}

export function canApproveTransaction(user?: UserLike): boolean {
  const r = roleName(user);
  // approving transactions allowed for admin, manager and accountant roles
  return (
    r === 'admin' || r === 'administrator' || r === 'manager' || r === 'accountant'
  );
}

export function canEditTransaction(user?: UserLike): boolean {
  const r = roleName(user);
  // Only disallow the basic 'user' role from editing transactions
  return r !== 'user';
}
