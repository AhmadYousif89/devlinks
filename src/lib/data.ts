import GithubIcon from "public/assets/images/icon-github.svg";
import FrontendMentorIcon from "public/assets/images/icon-frontend-mentor.svg";
import TwitterIcon from "public/assets/images/icon-twitter.svg";
import LinkedInIcon from "public/assets/images/icon-linkedin.svg";
import YoutubeIcon from "public/assets/images/icon-youtube.svg";
import FacebookIcon from "public/assets/images/icon-facebook.svg";
import TwitchIcon from "public/assets/images/icon-twitch.svg";
import DevtoIcon from "public/assets/images/icon-devto.svg";
import CodewarsIcon from "public/assets/images/icon-codewars.svg";
import CodepenIcon from "public/assets/images/icon-codepen.svg";
import FreecodecampIcon from "public/assets/images/icon-freecodecamp.svg";
import GitlabIcon from "public/assets/images/icon-gitlab.svg";
import HashnodeIcon from "public/assets/images/icon-hashnode.svg";
import StackoverflowIcon from "public/assets/images/icon-stack-overflow.svg";

export const LINKS_DATA = {
  github: {
    name: "GitHub",
    icon: GithubIcon,
    domain: ["github.com", "www.github.com"],
    pattern: "/username",
    color: "#191919",
  },
  frontendMentor: {
    name: "Frontend Mentor",
    icon: FrontendMentorIcon,
    domain: ["frontendmentor.io", "www.frontendmentor.io"],
    pattern: "/profile/username",
    color: "#FFFFFF",
  },
  twitter: {
    name: "Twitter",
    icon: TwitterIcon,
    domain: ["twitter.com", "www.twitter.com"],
    pattern: "/username",
    color: "#43B7E9",
  },
  linkedIn: {
    name: "LinkedIn",
    icon: LinkedInIcon,
    domain: ["linkedin.com", "www.linkedin.com"],
    pattern: "/in/username",
    color: "#2D68FF",
  },
  youtube: {
    name: "YouTube",
    icon: YoutubeIcon,
    domain: ["youtube.com", "www.youtube.com"],
    pattern: "/@username",
    color: "#EE3838",
  },
  facebook: {
    name: "Facebook",
    icon: FacebookIcon,
    domain: ["facebook.com", "www.facebook.com"],
    pattern: "/username",
    color: "#2442AC",
  },
  twitch: {
    name: "Twitch",
    icon: TwitchIcon,
    domain: ["twitch.tv", "www.twitch.tv"],
    pattern: "/username",
    color: "#EE3FC8",
  },
  devto: {
    name: "Dev.to",
    icon: DevtoIcon,
    domain: ["dev.to", "www.dev.to"],
    pattern: "/username",
    color: "#333333",
  },
  codewars: {
    name: "Codewars",
    icon: CodewarsIcon,
    domain: ["codewars.com", "www.codewars.com"],
    pattern: "/users/username",
    color: "#8A1A50",
  },
  codepen: {
    name: "CodePen",
    icon: CodepenIcon,
    domain: ["codepen.io", "www.codepen.io"],
    pattern: "/username",
    color: "#47cf73",
  },
  freecodecamp: {
    name: "FreeCodeCamp",
    icon: FreecodecampIcon,
    domain: ["freecodecamp.org", "www.freecodecamp.org"],
    pattern: "/username",
    color: "#302267",
  },
  gitlab: {
    name: "GitLab",
    icon: GitlabIcon,
    domain: ["gitlab.com", "www.gitlab.com"],
    pattern: "/username",
    color: "#EB4925",
  },
  hashnode: {
    name: "Hashnode",
    icon: HashnodeIcon,
    domain: ["hashnode.com", "www.hashnode.com"],
    pattern: "/@username",
    color: "#0330D1",
  },
  stackoverflow: {
    name: "Stack Overflow",
    icon: StackoverflowIcon,
    domain: ["stackoverflow.com", "www.stackoverflow.com"],
    pattern: "/users/username",
    color: "#EC7100",
  },
} as const;

export const LINKS_DATA_LENGTH = Object.keys(LINKS_DATA).length;
