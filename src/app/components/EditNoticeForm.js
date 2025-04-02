import { FormControlLabel, Switch } from '@mui/material';
import { useEffect } from 'react';

const EditNoticeForm = () => {
  const [formData, setFormData] = useState({
    isVisible: 0
  });

  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (notice) {
      setFormData({
        ...notice,
        isVisible: notice.isVisible || 0
      });
    }
  }, [notice]);

  return (
    <div>
      {/* ... existing code ... */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.isVisible === 1}
            onChange={(e) => setFormData({
              ...formData,
              isVisible: e.target.checked ? 1 : 0
            })}
            color="primary"
          />
        }
        label="Make Notice Visible"
      />
      {/* ... existing code ... */}
    </div>
  );
};

export default EditNoticeForm; 