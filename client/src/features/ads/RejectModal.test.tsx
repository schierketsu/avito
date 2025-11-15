import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RejectModal } from './RejectModal';

describe('RejectModal', () => {
  it('requires reason and comment for "Другое"', () => {
    const handleSubmit = vi.fn();

    render(
      <RejectModal open onClose={() => undefined} onSubmit={handleSubmit} loading={false} />
    );

    const otherOption = screen.getByLabelText('Другое');
    fireEvent.click(otherOption);

    const submitButton = screen.getByRole('button', { name: /отправить/i });
    fireEvent.click(submitButton);

    expect(handleSubmit).not.toHaveBeenCalled();

    const commentInput = screen.getByLabelText('Комментарий');
    fireEvent.change(commentInput, { target: { value: 'Текст причины' } });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      reason: 'Другое',
      comment: 'Текст причины'
    });
  });
});


