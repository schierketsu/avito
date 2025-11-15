import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Stack,
  Typography
} from '@mui/material';

const REASONS = [
  'Запрещенный товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое'
] as const;

type RejectReason = (typeof REASONS)[number];

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { reason: string; comment?: string }) => void;
  loading?: boolean;
}

export const RejectModal: React.FC<RejectModalProps> = ({ open, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState<RejectReason | ''>('');
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = () => {
    setTouched(true);
    if (!reason) {
      return;
    }
    if (reason === 'Другое' && !comment.trim()) {
      return;
    }
    onSubmit({
      reason,
      comment: comment.trim() || undefined
    });
    setReason('');
    setComment('');
    setTouched(false);
  };

  const reasonError = touched && !reason;
  const commentError = touched && reason === 'Другое' && !comment.trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>📝 Отклонение</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography>Причина:</Typography>
          <RadioGroup
            value={reason}
            onChange={(e) => {
              setReason(e.target.value as RejectReason);
              setTouched(false);
            }}
          >
            {REASONS.map((r) => (
              <FormControlLabel key={r} value={r} control={<Radio />} label={r} />
            ))}
          </RadioGroup>
          {reason === 'Другое' && (
            <TextField
              label="Комментарий"
              multiline
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              error={commentError}
              helperText={commentError ? 'Пожалуйста, укажите причину' : undefined}
            />
          )}
          {reasonError && (
            <Typography color="error" variant="body2">
              Необходимо выбрать причину отклонения.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} color="error" variant="contained" disabled={loading}>
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );
};


