type BadgeIconProps = {
  icon: string;
  bg: string;
  color?: string;
};

export const BadgeIcon = ({ icon, bg, color = '#fff' }: BadgeIconProps) => (
  <span
    className="material-symbols-outlined"
    style={{
      backgroundColor: bg,
      color,
      width: 22,
      height: 22,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      lineHeight: 1,
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
      flexShrink: 0,
    }}
  >
    {icon}
  </span>
);
