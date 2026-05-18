import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Avatar,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export type ConfirmDialogType = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmDialogType;
  confirmLabel?: string;
  cancelLabel?: string;
}

const typeConfig = {
  danger:  { iconBg: '#fef2f2', iconColor: '#CC2200', Icon: WarningAmberIcon, btnColor: 'error'   as const },
  warning: { iconBg: '#fffbeb', iconColor: '#b45309', Icon: WarningAmberIcon, btnColor: 'warning' as const },
  info:    { iconBg: '#C2E0FF', iconColor: '#0066CC', Icon: HelpOutlineIcon,  btnColor: 'primary' as const },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmDialogProps) {
  const { iconBg, iconColor, Icon, btnColor } = typeConfig[type];

  const handleConfirm = () => { onConfirm(); onClose(); };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, pt: 3, pb: 1 }}>
        <Avatar sx={{ bgcolor: iconBg, width: 44, height: 44, flexShrink: 0 }}>
          <Icon sx={{ color: iconColor, fontSize: 22 }} />
        </Avatar>
        <span style={{ paddingTop: 4 }}>{title}</span>
      </DialogTitle>
      <DialogContent sx={{ pl: '80px' }}>
        <DialogContentText fontSize={14}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="text" color="inherit" size="small">
          {cancelLabel}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color={btnColor} size="small" disableElevation>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
