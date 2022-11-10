import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChartData } from 'models/ChartData';

interface ChartViewState {
    chartData: ChartData;
}

const initialState: ChartViewState = {
    chartData: [],
};

const chartSlice = createSlice({
    name: 'chartView',
    initialState,
    reducers: {
        setChartData: (state, action: PayloadAction<ChartData>) => {
            state.chartData = action.payload;
        },
    },
});

export const { setChartData } = chartSlice.actions;

export default chartSlice.reducer;
