import { FormControlLabel, Switch } from '@mui/material';
import { useSession } from 'next-auth/react'
import { depList, administrationList } from '../../lib/const'

const AddNoticeForm = ({ onAdd, onCancel }) => {
  const { data: session } = useSession();
  const [newNotice, setNewNotice] = useState({
    title: '',
    notice_type: session?.user?.role === 'DEPT_ADMIN' ? 'Department' : '',
    department: session?.user?.role === 'DEPT_ADMIN' ? session.user.department : '',
    link: '',
    is_new: false,
    is_important: false,
    date: new Date().toISOString().split('T')[0],
  });

  const [formData, setFormData] = useState({
    isVisible: 1, // Default to visible
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={newNotice.title}
        onChange={handleChange}
        placeholder="Notice Title"
        required
      />

      <select
        name="notice_type"
        value={newNotice.notice_type}
        onChange={handleChange}
        disabled={session?.user?.role === 'DEPT_ADMIN'}
      >
        <option value="">Select Notice Type</option>
        {session?.user?.role === 'DEPT_ADMIN' ? (
          <option value="Department">Department</option>
        ) : (
          <>
            <option value="General">General</option>
            <option value="Department">Department</option>
            <option value="Academics">Academics</option>
            {Array.from(administrationList.entries()).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </>
        )}
      </select>

      {newNotice.notice_type === 'Department' && (
        <select
          name="department"
          value={newNotice.department}
          onChange={handleChange}
          disabled={session?.user?.role === 'DEPT_ADMIN'}
        >
          <option value="">Select Department</option>
          {Array.from(depList.entries()).map(([key, value]) => (
            <option key={key} value={value}>{value}</option>
          ))}
        </select>
      )}

      <input
        type="text"
        name="link"
        value={newNotice.link}
        onChange={handleChange}
        placeholder="Link (if any)"
      />

      <FormControlLabel
        control={
          <Switch
            checked={formData.isVisible}
            onChange={(e) => setFormData({
              ...formData,
              isVisible: e.target.checked ? 1 : 0
            })}
            color="primary"
          />
        }
        label="Make Notice Visible"
      />

      <button type="submit">Add Notice</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default AddNoticeForm;