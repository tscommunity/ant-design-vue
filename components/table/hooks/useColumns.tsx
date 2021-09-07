import devWarning from '../../vc-util/devWarning';
import type { Ref } from 'vue';
import { ContextSlots } from '../context';
import type { TransformColumns, ColumnsType } from '../interface';

function fillSlots<RecordType>(columns: ColumnsType<RecordType>, contextSlots: Ref<ContextSlots>) {
  const $slots = contextSlots.value;
  return columns.map(column => {
    const cloneColumn = { ...column };
    const { slots = {} } = cloneColumn;
    cloneColumn.__originColumn__ = column;
    devWarning(
      !('slots' in cloneColumn),
      'Table',
      '`column.slots` is deprecated. Please use `v-slot:headerCell` `v-slot:bodyCell` instead.',
    );

    Object.keys(slots).forEach(key => {
      const name = slots[key];
      if (cloneColumn[key] === undefined && $slots[name]) {
        cloneColumn[key] = $slots[name];
      }
    });

    if (contextSlots.value.headerCell && !column.slots?.title) {
      cloneColumn.title = contextSlots.value.headerCell({
        title: column.title,
        column,
      });
    }
    if ('children' in cloneColumn) {
      cloneColumn.children = fillSlots(cloneColumn.children, contextSlots);
    }

    return cloneColumn;
  });
}

export default function useColumns<RecordType>(
  contextSlots: Ref<ContextSlots>,
): [TransformColumns<RecordType>] {
  const filledColumns = (columns: ColumnsType<RecordType>) => fillSlots(columns, contextSlots);

  return [filledColumns];
}
