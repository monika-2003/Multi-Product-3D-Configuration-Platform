import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigEditor from '../components/ConfigEditor.jsx';

const draft = {
  color: '#aabbcc',
  scale: 1,
  camera: { fov: 45, position: [0, 0, 3] },
};

const allFlags = {
  allowColor: true,
  allowScale: true,
  allowCamera: true,
};

describe('ConfigEditor', () => {
  test('calls onChange when color and scale change', () => {
    const onChange = jest.fn();
    render(
      <ConfigEditor draft={draft} featureFlags={allFlags} onChange={onChange} onReset={jest.fn()} />
    );

    fireEvent.change(screen.getByLabelText('Product color'), {
      target: { value: '#ff0000' },
    });
    expect(onChange).toHaveBeenCalledWith({ color: '#ff0000' });

    fireEvent.change(screen.getByLabelText('Product scale'), {
      target: { value: '2' },
    });
    expect(onChange).toHaveBeenCalledWith({ scale: 2 });
  });

  test('hides fields when feature flags are off', () => {
    render(
      <ConfigEditor
        draft={draft}
        featureFlags={{ allowColor: false, allowScale: true, allowCamera: false }}
        onChange={jest.fn()}
        onReset={jest.fn()}
      />
    );

    expect(screen.queryByLabelText('Product color')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Product scale')).toBeInTheDocument();
    expect(screen.queryByLabelText('Camera FOV')).not.toBeInTheDocument();
  });

  test('reset button calls onReset', async () => {
    const user = userEvent.setup();
    const onReset = jest.fn();
    render(
      <ConfigEditor draft={draft} featureFlags={allFlags} onChange={jest.fn()} onReset={onReset} />
    );

    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  test('camera FOV change notifies parent', () => {
    const onChange = jest.fn();
    render(
      <ConfigEditor draft={draft} featureFlags={allFlags} onChange={onChange} onReset={jest.fn()} />
    );

    fireEvent.change(screen.getByLabelText('Camera FOV'), {
      target: { value: '60' },
    });
    expect(onChange).toHaveBeenCalledWith({ camera: { fov: 60 } });
  });
});
