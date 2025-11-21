interface TypeLinks {
    label?: string;
    href: string;
    image?: string;
}

   export const mainLinks: TypeLinks[] = [
        { label: "Rahat Hossain", href: "/" }
    ]

   export const userLinks: TypeLinks[] = [
        { image: "/images/svg/shop.svg", href: "/" }
    ]

   export const secLinks: TypeLinks[] = [
        { image: "/images/svg/profile.svg", href: "/" },
        { image: "/images/svg/works.svg", href: "/" },
        { image: "/images/svg/skills.svg", href: "/" },
        { image: "/images/svg/resume.svg", href: "/" },
        { image: "/images/svg/blog.svg", href: "/" },
        { image: "/images/svg/contact.svg", href: "/" },
        { image: "/images/svg/lessons.svg", href: "/" },
    ]

   export const contactLinks: TypeLinks [] = [
    { image: "/images/contacts/call.svg", href: "/" },
    { image: "/images/contacts/email.svg", href: "/" }
];
