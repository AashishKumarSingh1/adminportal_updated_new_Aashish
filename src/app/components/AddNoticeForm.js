import { FormControlLabel, Switch } from '@mui/material';

const [formData, setFormData] = useState({
  isVisible: 1, // Default to visible
});

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