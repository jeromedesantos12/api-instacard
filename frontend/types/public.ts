export type PublicProfile = {
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  accent?: string;
  socials?: Array<{ platform: string; url: string }>;
  links: Array<{
    id: string;
    title: string;
    url: string;
    description?: string;
  }>;
};
