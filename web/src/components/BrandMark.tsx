import CampaignIcon from "@mui/icons-material/Campaign";

export const BrandMark = ({ size = 36 }: { size?: number }) => (
  <span
    className="grid place-items-center overflow-hidden rounded-xl text-white shadow-sm"
    style={{
      width: size,
      height: size,
      background: "linear-gradient(135deg, #a78bfa, #6d28d9)"
    }}
  >
    <CampaignIcon sx={{ fontSize: Math.round(size * 0.56) }} />
  </span>
);
