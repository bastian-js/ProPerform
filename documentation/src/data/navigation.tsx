import type { JSX } from "react";
import { House, BookOpen, Code, Settings } from "lucide-react";

export type SubSubLink = {
  to: string;
  label: string;
};

export type SubLink =
  | {
      label: string;
      to: string;
    }
  | {
      label: string;
      subLinks: SubSubLink[];
    };

export type NavLink = {
  to: string;
  icon: JSX.Element;
  label: string;
  subLinks?: SubLink[];
};

export const navLinks: NavLink[] = [
  { to: "/", icon: <House size={20} />, label: "Home" },

  {
    to: "/docs",
    icon: <BookOpen size={20} />,
    label: "Dokumentation",
    subLinks: [
      {
        to: "/docs/training-plans-implementation",
        label: "Training Plans Guide",
      },
      { to: "/docs/test-users", label: "Test Users" },
      { to: "/docs/error-responses", label: "Error Responses" },
      { to: "/docs/verify-token", label: "Verify Token" },
    ],
  },

  {
    to: "/api",
    icon: <Code size={20} />,
    label: "API Reference",
    subLinks: [
      {
        label: "Auth",
        subLinks: [
          { to: "/api/auth/login", label: "POST /auth/login" },
          { to: "/api/auth/register", label: "POST /auth/register" },
          { to: "/api/auth/logout", label: "POST /auth/logout" },
          {
            to: "/api/auth/admin/register",
            label: "POST /auth/admin/register",
          },
          { to: "/api/auth/admin/login", label: "POST /auth/admin/login" },
          {
            to: "/api/auth/trainers/register",
            label: "POST /auth/trainers/register",
          },
          {
            to: "/api/auth/trainers/login",
            label: "POST /auth/trainers/login",
          },
          {
            to: "/api/auth/check-verification-code",
            label: "POST /auth/check-verification-code",
          },
          {
            to: "/api/auth/resend-verification-code",
            label: "POST /auth/resend-verification-code",
          },
          {
            to: "/api/auth/reset-password",
            label: "POST /auth/reset-password",
          },
          {
            to: "/api/auth/reset-password/:token",
            label: "POST /auth/reset-password/:token",
          },
          {
            to: "/api/auth/push-token",
            label: "POST /auth/push-token",
          },
          {
            to: "/api/auth/refresh",
            label: "POST /auth/refresh",
          },
          {
            to: "/api/auth/verify-token",
            label: "GET /auth/verify-token",
          },
        ],
      },
      {
        label: "Users",
        subLinks: [
          { to: "/api/users", label: "GET /users" },
          { to: "/api/users/:role", label: "GET /users/:role" },
          { to: "/api/users/me", label: "GET /users/me" },
          { to: "/api/users/me/update", label: "PUT /users/me" },
          { to: "/api/users/me/trainer", label: "GET /users/me/trainer" },
          { to: "/api/users/stats", label: "GET /users/stats" },
          { to: "/api/users/delete/:uid", label: "DELETE /users/:uid" },
          { to: "/api/streak/update", label: "POST /streak/update" },
          { to: "/api/streak/:type", label: "POST /streak/:type" },
        ],
      },
      {
        label: "Weight Logs",
        subLinks: [
          { to: "/api/logs/weight", label: "POST /logs/weight" },
          { to: "/api/logs/weight/all", label: "GET /logs/weight" },
        ],
      },
      {
        label: "Exercises",
        subLinks: [
          { to: "/api/exercises", label: "GET /exercises" },
          {
            to: "/api/admin/exercises/create",
            label: "POST /admin/exercises/create",
          },
          {
            to: "/api/admin/exercises/:eid",
            label: "GET /admin/exercises/:eid",
          },
          {
            to: "/api/admin/exercises/:eid/delete",
            label: "DELETE /admin/exercises/:eid",
          },
          {
            to: "/api/admin/exercises/:eid/update",
            label: "PUT /admin/exercises/:eid",
          },
          {
            to: "/api/admin/exercises/muscle-groups",
            label: "GET /admin/exercises/muscle-groups",
          },
        ],
      },
      {
        label: "Trainers",
        subLinks: [
          { to: "/api/trainers/:tid", label: "DELETE /trainers/:tid" },
          {
            to: "/api/trainers/:tid/regenerate-code",
            label: "PATCH /trainers/:tid/regenerate-code",
          },
          {
            to: "/api/trainers/check-invite-code",
            label: "POST /trainers/check-invite-code",
          },
          {
            to: "/api/trainers/connect",
            label: "POST /trainers/connect",
          },
          {
            to: "/api/trainers/disconnect",
            label: "GET /trainers/disconnect",
          },
          {
            to: "/api/trainers/:tid/athletes",
            label: "GET /trainers/:tid/athletes",
          },
          {
            to: "/api/trainers/me",
            label: "GET /trainers/me",
          },
        ],
      },
      {
        label: "Media",
        subLinks: [
          { to: "/api/media", label: "POST /media" },
          { to: "/api/media/list", label: "GET /media" },
          { to: "/api/media/:mid", label: "GET /media/:mid" },
          { to: "/api/media/:mid/delete", label: "DELETE /media/:mid" },
          { to: "/api/media/:mid/update", label: "PUT /media/:mid" },
        ],
      },
      {
        label: "Notifications",
        subLinks: [
          { to: "/api/notifications/me", label: "GET /notifications/me" },
          {
            to: "/api/admin/notifications/send",
            label: "POST /admin/notifications/send",
          },
          {
            to: "/api/admin/notifications",
            label: "GET /admin/notifications",
          },
        ],
      },
      {
        label: "System",
        subLinks: [
          { to: "/api/system/health", label: "GET /system/health" },
          { to: "/api/system/healthcheck", label: "GET /system/healthcheck" },
          { to: "/api/system/save-log", label: "POST /system/save-log" },
        ],
      },
      {
        label: "Training Plans",
        subLinks: [
          { to: "/api/training-plans", label: "GET /training-plans" },
          { to: "/api/training-plans/create", label: "POST /training-plans" },
          {
            to: "/api/training-plans/:tpid",
            label: "GET /training-plans/:tpid",
          },
          {
            to: "/api/training-plans/:tpid/update",
            label: "PUT /training-plans/:tpid",
          },
          {
            to: "/api/training-plans/:tpid/delete",
            label: "DELETE /training-plans/:tpid",
          },
          {
            to: "/api/training-plans/:tpid/exercises",
            label: "GET /training-plans/:tpid/exercises",
          },
          {
            to: "/api/training-plans/:tpid/exercises/add",
            label: "POST /training-plans/:tpid/exercises",
          },
          {
            to: "/api/training-plans/:tpid/exercises/:id/update",
            label: "PUT /training-plans/:tpid/exercises/:id",
          },
          {
            to: "/api/training-plans/:tpid/exercises/:id/delete",
            label: "DELETE /training-plans/:tpid/exercises/:id",
          },
        ],
      },
      {
        label: "User Training Plans",
        subLinks: [
          {
            to: "/api/users/training-plans",
            label: "GET /users/training-plans",
          },
          {
            to: "/api/users/training-plans/assign",
            label: "POST /users/training-plans",
          },
          {
            to: "/api/users/training-plans/selected",
            label: "GET /users/training-plans/selected",
          },
          {
            to: "/api/users/training-plans/training/today",
            label: "GET /users/training-plans/training/today",
          },
          {
            to: "/api/users/training-plans/start/current",
            label: "GET /users/training-plans/start/current",
          },
          {
            to: "/api/users/training-plans/:id/select",
            label: "PATCH /users/training-plans/:id/select",
          },
          {
            to: "/api/users/training-plans/:id/delete",
            label: "DELETE /users/training-plans/:id",
          },
        ],
      },
    ],
  },

  { to: "/settings", icon: <Settings size={20} />, label: "Einstellungen" },
];

export const searchLinks = (() => {
  const items: { to: string; label: string; category: string }[] = [];

  const walk = (links: NavLink[]) => {
    for (const link of links) {
      items.push({
        to: link.to,
        label: link.label,
        category: "Navigation",
      });

      if (link.subLinks) {
        for (const sub of link.subLinks) {
          if ("subLinks" in sub) {
            for (const subsub of sub.subLinks) {
              items.push({
                to: subsub.to,
                label: subsub.label,
                category: sub.label,
              });
            }
          }
        }
      }
    }
  };

  walk(navLinks);
  return items;
})();
