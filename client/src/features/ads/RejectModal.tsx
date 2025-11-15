import React, { useEffect, useRef, useState } from 'react';
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
  Typography,
  FormHelperText
} from '@mui/material';

const REASONS = [
  'Запрещенный товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое'
] as const;

const REASON_DESCRIPTIONS: Record<string, string> = {
  'Запрещенный товар': 'Например, оружие, наркотики, поддельные документы и другие запрещённые позиции.',
  'Неверная категория': 'Товар размещён не в той категории, что усложняет поиск для покупателей.',
  'Некорректное описание': 'Описание не раскрывает суть товара, содержит ошибки или вводит в заблуждение.',
  'Проблемы с фото': 'Фотографии низкого качества, содержат посторонние элементы или нарушают правила.',
  'Подозрение на мошенничество':
    'Есть признаки обмана: слишком низкая цена, просьба перевести деньги заранее и т.п.',
  Другое: 'Опишите вашу причину в свободной форме.'
};

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
  const firstRadioRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && firstRadioRef.current) {
      firstRadioRef.current.focus();
    }
  }, [open]);

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
            {REASONS.map((r, index) => (
              <FormControlLabel
                key={r}
                value={r}
                control={
                  <Radio
                    inputRef={index === 0 ? firstRadioRef : undefined}
                    inputProps={{ 'aria-label': r }}
                  />
                }
                label={r}
              />
            ))}
          </RadioGroup>
          {reason && (
            <FormHelperText>{REASON_DESCRIPTIONS[reason] ?? 'Уточните причину отклонения.'}</FormHelperText>
          )}
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


