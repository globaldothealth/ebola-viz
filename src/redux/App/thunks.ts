import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDataPortalUrl, Env } from 'utils/helperFunctions';

export const fetchAppVersion = createAsyncThunk<
    string,
    void,
    { rejectValue: string }
>('app/fetchAppVersion', async (_, { rejectWithValue }) => {
    const env = process.env.REACT_APP_ENV as Env;
    const dataPortalUrl = getDataPortalUrl(env);

    try {
        const response = await fetch(`${dataPortalUrl}/version`);

        const versionBlob = await response.blob();
        const version = await versionBlob.text();

        return version;
    } catch (err: any) {
        if (err.response) return rejectWithValue(err.response.message);

        throw err;
    }
});
